const { Router } = require("express");
const router = Router();
const pool = require("../database/db");
const {
  getAllTransactions,
  getTransactionsInRange,
  addTransactionFromReceipt,
} = require("./queries");
const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");

require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    const aggregate = req.query.aggregate;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (startDate && endDate) {
      const { rows } = await pool.query(getTransactionsInRange, [
        startDate,
        endDate,
      ]);
      const aggregatedTransactions = aggregateData(rows);
      const sorted = aggregatedTransactions.sort(sortDescending);
      res.json(sorted);
    } else if (aggregate) {
      const { rows } = await pool.query(getAllTransactions);
      const aggregatedTransactions = aggregateData(rows);
      const sorted = aggregatedTransactions.sort(sortDescending);
      res.json(sorted);
    } else {
      const { rows } = await pool.query(getAllTransactions);
      res.json(rows);
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.post("/receipt", async (req, res) => {
  try {
    const imgUrl = req.body.imgUrl;
    const receipt = await tryReceiptAnalysis(imgUrl);
    const merchant_name = receipt.fields["MerchantName"].value;
    const amount = receipt.fields["Total"].value;
    const transactionDate = receipt.fields["TransactionDate"].content;
    const split = transactionDate.split("/");
    const formattedDate = `${split[2]}-${split[0]}-${split[1]}`;
    const row = await pool.query(addTransactionFromReceipt, [
      1,
      merchant_name,
      formattedDate,
      parseInt(amount),
      "Other",
    ]);
    res.json({ message: formattedDate });
  } catch (e) {
    console.log("Error in /receipt route", e);
    res.status(400).json({ message: e });
  }
});

async function tryReceiptAnalysis(receiptUrl) {
  const credential = new AzureKeyCredential(process.env.AZURE_CREDENTIAL);
  const endpoint = process.env.AZURE_ENDPOINT;

  const client = new DocumentAnalysisClient(endpoint, credential);
  const poller = await client.beginAnalyzeDocumentFromUrl(
    "prebuilt-receipt",
    receiptUrl
  );
  poller.onProgress((state) =>
    console.log("Operation:", state.modelId, state.status)
  );
  const { documents } = await poller.pollUntilDone();

  const result = documents && documents[0];
  if (result) {
    return result;
  } else {
    throw new Error("No recipt found.");
  }
}

function sortDescending(a, b) {
  return b.amount - a.amount;
}

function aggregateData(transactions) {
  let singles = [];

  transactions.map((transaction) => {
    const found = singles.findIndex((element) => {
      return element.merchant_name === transaction.merchant_name;
    });
    if (found === -1) {
      console.log(transaction.merchant_name);
      singles.push(transaction);
    } else {
      singles[found].amount = singles[found].amount + transaction.amount;
    }
  });

  return singles;
}

module.exports = router;

const { Router } = require("express");
const router = Router();
const { PlaidProcessor } = require("../Services/PlaidProcessor");
const pool = require("../database/db");
const queries = require("./queries");
require("dotenv").config();

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const plaidConfiguration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfiguration);
const plaidProcessor = new PlaidProcessor(plaidClient);
const USER_ID = 1;

router.get("/initial_token", async (req, res) => {
  try {
    const linkTokenConfig = {
      user: {
        client_user_id: "1",
      },
      client_name: process.env.PLAID_CLIENT_NAME,
      products: ["auth", "transactions"],
      language: "en",
      country_codes: ["US"],
    };

    const token = await plaidProcessor.getInitialToken(linkTokenConfig);
    res.send(token);
  } catch (e) {
    console.log("Inital Token route error:", e);
    res.status(400).send(e);
  }
});

router.post("/public_token", async (req, res) => {
  const publicToken = req.body.publicToken;
  console.log(req.body);
  try {
    const accessToken = await plaidProcessor.getAccessToken(publicToken);
    const result = await pool.query(queries.addAccessToken, [
      accessToken,
      USER_ID,
    ]);
    const transactions = await plaidProcessor.downloadTransactions(accessToken);
    const done = await transactions.map(addToDatabase);
    res.json(transactions);
  } catch (error) {
    console.log("Error in /public_token route", error);
    res.status(400).json(JSON.stringify(error));
  }
});

async function addToDatabase(transaction) {
  let { transaction_id, merchant_name, date, amount, category } = transaction;
  merchant_name = merchant_name || "Other";

  const fieldsExist =
    transaction_id !== undefined &&
    merchant_name !== undefined &&
    date !== undefined &&
    amount !== undefined &&
    category !== undefined;

  if (fieldsExist) {
    const row = await pool.query(queries.addTransactionFromBank, [
      USER_ID,
      transaction_id,
      merchant_name,
      date,
      parseInt(amount),
      category[0],
    ]);
  }
}

module.exports = router;

const getAllTransactions = "SELECT * FROM Transactions;";
const getTransactionsInRange =
  "SELECT * FROM Transactions WHERE date >= $1 AND date<=$2";

const addTransactionFromReceipt =
  "INSERT into transactions (uid, merchant_name, date, amount, category) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING *;";

module.exports = {
  getAllTransactions,
  getTransactionsInRange,
  addTransactionFromReceipt,
};

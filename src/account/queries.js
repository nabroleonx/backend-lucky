const addAccessToken = "UPDATE users SET access_token=$1 WHERE uid=$2";
const addTransactionFromBank =
  "INSERT into transactions (uid, transaction_id, merchant_name, date, amount, category) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING RETURNING *;";

module.exports = {
  addAccessToken,
  addTransactionFromBank,
};

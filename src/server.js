const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const accountRoutes = require("./account/routes");
const transactionRoutes = require("./transaction/routes");
const goalRoutes = require("./goal/routes");
require("dotenv").config();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goal", goalRoutes);

app.listen(port, () => {
  console.log(`Backend running on ${port}`);
});

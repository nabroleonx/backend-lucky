class PlaidProcessor {
  constructor(plaidClient) {
    this.plaidClient = plaidClient;
  }
  async getInitialToken(linkTokenConfig) {
    const createTokenResponse = await this.plaidClient.linkTokenCreate(
      linkTokenConfig
    );
    return createTokenResponse.data;
  }
  async getAccessToken(publicToken) {
    const result = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = result.data.access_token;
    return accessToken;
  }
  async downloadTransactions(access_token) {
    const request = {
      access_token: access_token,
      start_date: "2022-01-01",
      end_date: "2022-10-15",
    };
    const response = await this.plaidClient.transactionsGet(request);
    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;
    console.log("total:", total_transactions);

    while (transactions.length < total_transactions) {
      const paginatedRequest = {
        access_token: access_token,
        start_date: "2022-01-01",
        end_date: "2022-10-15",
        options: {
          offset: transactions.length,
        },
      };
      const paginatedResponse = await this.plaidClient.transactionsGet(
        paginatedRequest
      );
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    const retrievedTransactions = transactions.filter(
      (transaction) => transaction.amount > 0
    );

    console.log("Done with requests");

    return retrievedTransactions;
  }
}

exports.PlaidProcessor = PlaidProcessor;

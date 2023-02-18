const { GoogleSpreadSheetsApi } = require("./out/index");

require("dotenv").config();
const crypto = require("crypto");

const googleSheetsApi = new GoogleSpreadSheetsApi({
  spreadSheetId: process.env.SPREAD_SHEET_ID,
  scope: "write",
  credentials: {
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY,
  },
});

const start = async () => {
  // const insertedRowResponse = await googleSheetsApi.insertRow([
  //   crypto.randomBytes(16).toString("hex"),
  //   "hello@world.com",
  //   "123456789",
  // ]);

  const rows = await googleSheetsApi.getRows();
  console.log(rows);

  console.log("The operation went successful ✅");
};

start();

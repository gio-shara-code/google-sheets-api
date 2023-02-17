import { google, sheets_v4, Auth } from "googleapis";

interface Credentials {
  clientId: string;
  clientEmail: string;
  privateKey: string;
  tokenUrl: string;
}

export interface GoogleSheetsApiConstructorArgs {
  scope: "readonly" | "write";
  projectId: string;
  credentials: Credentials;
  spreadSheetId: string;
}

export class GoogleSpreadSheetsApi {
  private auth: Auth.GoogleAuth;
  private spreadSheetId: string;
  private sheets: sheets_v4.Sheets;

  constructor(args: GoogleSheetsApiConstructorArgs) {
    this.sheets = google.sheets("v4");

    const { credentials, projectId, scope, spreadSheetId } = args;
    this.spreadSheetId = spreadSheetId;
    this.auth = new google.auth.GoogleAuth({
      // projectId,
      credentials: {
        type: "service_account",
        // client_id: credentials.clientId,
        client_email: credentials.clientEmail,
        private_key: credentials.privateKey,
        // token_url: credentials.tokenUrl,
      },
      scopes:
        scope === "readonly"
          ? ["https://www.googleapis.com/auth/spreadsheets.readonly"]
          : ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  async updateSpreadSheet(values: (string | number)[][]) {
    return await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadSheetId,
      auth: await this.auth.getClient(),
      valueInputOption: "USER_ENTERED",
      range: "Sheet1!A1:C1",
      requestBody: {
        range: "Sheet1!A1:C1",
        majorDimension: "ROWS",
        values,
      },
    });
  }

  // async getSpreadSheetCells() {
  //   return await this.sheets.spreadsheets.get({
  //     spreadsheetId: this.spreadSheetId,
  //     includeGridData: true,
  //     auth: await this.auth.getClient(),
  //   });
  // }
}

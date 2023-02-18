import { google, sheets_v4, Auth } from "googleapis";

interface Credentials {
  clientEmail: string;
  privateKey: string;
}

export interface GoogleSheetsApiConstructorArgs {
  scope: "readonly" | "write";
  credentials: Credentials;
  spreadSheetId: string;
  sheetName?: string;
}

export class GoogleSpreadSheetsApi {
  private auth: Auth.GoogleAuth;
  private spreadSheetId: string;
  private sheets: sheets_v4.Sheets;
  private sheetName: string;

  constructor(args: GoogleSheetsApiConstructorArgs) {
    this.sheets = google.sheets("v4");
    this.sheetName = args.sheetName || "Sheet1";

    const { credentials, scope, spreadSheetId } = args;
    this.spreadSheetId = spreadSheetId;
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        client_email: credentials.clientEmail,
        private_key: credentials.privateKey,
      },
      scopes:
        scope === "readonly"
          ? ["https://www.googleapis.com/auth/spreadsheets.readonly"]
          : ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  async insertRows(values: (string | number)[][]) {
    return this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadSheetId,
      auth: await this.auth.getClient(),
      valueInputOption: "USER_ENTERED",
      range: this.sheetName,
      requestBody: {
        majorDimension: "ROWS",
        values,
      },
    });
  }

  insertRow(value: (string | number)[]) {
    return this.insertRows([value]);
  }

  async getRows() {
    type EmptyObject = {};

    type Value = {
      userEnteredValue: { stringValue: string };
      effectiveValue: { stringValue: string };
      formattedValue: string;
    };

    type ValuesObject = {
      values: Value[];
    };

    type RowData = (EmptyObject | ValuesObject)[]; // string = values
    const spreadSheetResult = await this.sheets.spreadsheets.get({
      auth: await this.auth.getClient(),
      spreadsheetId: this.spreadSheetId,
      includeGridData: true,
    });

    const rowData: RowData = spreadSheetResult.data.sheets[0].data[0].rowData;

    const rowTitles = rowData.slice(0, 1); // only title row

    const titles: string[] = [];
    if ("values" in rowTitles[0]) {
      rowTitles[0].values.map((rowDataTitleValue) => {
        titles.push(rowDataTitleValue.formattedValue);
      });
    } else {
      // TODO: handle empty title
    }

    const rowRest = rowData.slice(1);

    const formattedRows: Record<string, string>[] = [];
    rowRest.map((row, index) => {
      if ("values" in row) {
        console.log(row.values);
        const valueObject: Record<string, string> = {};
        row.values.forEach((rowValue, index) => {
          if (typeof titles[index] === "string" && "formattedValue" in rowValue)
            valueObject[titles[index]] = rowValue.formattedValue;
        });

        formattedRows.push(valueObject);
      } else {
        // TODO: handle emptry rows
      }
    });
    return formattedRows;
  }
}

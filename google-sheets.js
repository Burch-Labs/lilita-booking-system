import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];
const TOKEN_PATH = path.join(process.cwd(), 'google-token.json');

class GoogleSheetsConnector {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
  }

  getOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );
  }

  async loadSavedToken() {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials(token);
      this.auth = oauth2Client;
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      return true;
    }
    return false;
  }

  async authenticate() {
    console.log('🔐 Authenticating with Google Sheets...');
    const loaded = await this.loadSavedToken();
    if (loaded) {
      console.log('✓ Using existing authentication token');
      return true;
    }
    console.log('⚠️  No token found. User needs to authenticate via web interface.');
    return false;
  }

  getAuthUrl() {
    const oauth2Client = this.getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return authUrl;
  }

  async handleAuthCallback(code) {
    console.log('🔄 Handling auth callback...');
    try {
      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

      oauth2Client.setCredentials(tokens);
      this.auth = oauth2Client;
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });

      console.log('✓ Authentication successful');
      return true;
    } catch (err) {
      console.error('Error in auth callback:', err.message);
      throw err;
    }
  }

  async isAuthenticated() {
    if (this.auth && this.sheets) return true;
    return await this.loadSavedToken();
  }

  async getSheetsList() {
    if (!await this.isAuthenticated()) throw new Error('Not authenticated');

    console.log('📋 Fetching list of spreadsheets...');

    try {
      const res = await this.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        spaces: 'drive',
        fields: 'files(id, name, webViewLink)',
        pageSize: 50
      });

      const files = res.data.files || [];
      console.log(`✓ Found ${files.length} spreadsheets`);
      return files;
    } catch (err) {
      console.error('Error fetching sheets:', err.message);
      throw err;
    }
  }

  async getSheetMetadata(spreadsheetId) {
    if (!await this.isAuthenticated()) throw new Error('Not authenticated');

    console.log(`📊 Fetching metadata for sheet ${spreadsheetId}...`);

    try {
      const res = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title))'
      });

      const sheets = res.data.sheets || [];
      console.log(`✓ Found ${sheets.length} sheets`);
      return sheets.map(s => ({
        id: s.properties.sheetId,
        title: s.properties.title
      }));
    } catch (err) {
      console.error('Error fetching metadata:', err.message);
      throw err;
    }
  }

  async getSheetData(spreadsheetId, sheetName) {
    if (!await this.isAuthenticated()) throw new Error('Not authenticated');

    console.log(`📥 Fetching data from ${sheetName}...`);

    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A:Z`
      });

      const rows = res.data.values || [];
      console.log(`✓ Retrieved ${rows.length} rows`);

      if (rows.length === 0) return [];

      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return obj;
      });

      return data;
    } catch (err) {
      console.error('Error fetching sheet data:', err.message);
      throw err;
    }
  }
}

export default new GoogleSheetsConnector();

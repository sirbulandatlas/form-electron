import { app, BrowserWindow, ipcMain } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow | null;

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Load the Angular app's HTML file
  const indexPath = path.join(__dirname, 'data-test-app', 'index.html');
  win.loadURL(
    url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true,
    })
  );

  // Handle IPC from renderer process to save data to a file
  ipcMain.on('save-data', (event, data: string) => {
    try {
      fs.writeFileSync('data.txt', data);
      win!.webContents.send('data-from-main', data);

    } catch (error: any) {
      event.sender.send('save-error', { message: "Something went wrong while saving records", code: error.code });
    }
  });

  ipcMain.on('fetch-data', (event) => {
    try {
      const data = fs.readFileSync('data.txt', 'utf8');

      event.sender.send('data-from-main', data);
    } catch (error: any) {
      event.sender.send('save-error', { message: "Something went wrong while fetching records", code: error.code });
    }
  });
}

app.on('ready', createWindow);

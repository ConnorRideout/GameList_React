/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import { BrowserWindow } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function setSecretKey(secretKey: string, mainWindow: BrowserWindow) {
  try {
    // save the key to .env file
    const envContent = `SECRET_KEY=${secretKey}\n`;
    fs.appendFileSync('./.env', envContent, { flag: 'a' });
  } catch (err) {
    console.error(err)
  }
  // Update process.env for current execution context
  process.env.SECRET_KEY = secretKey;
  mainWindow.webContents.executeJavaScript(`window.processEnv = ${JSON.stringify(process.env)}`)

  console.log('SECRET_KEY saved to .env file and updated in current env variables.');
}

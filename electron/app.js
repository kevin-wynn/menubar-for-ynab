require('dotenv').config()
const path = require('path')
const url = require('url')
const { app, Menu, Tray, nativeImage, BrowserWindow, ipcMain } = require('electron')
const { channels } = require('../src/constants')
const numeral = require('numeral')
const fetch = require('node-fetch')

const YNABPath = 'https://api.youneedabudget.com/v1';

let tray;
let mainWindow;

const getYNABDetails = () => {
  let balances = []
  fetch(`${YNABPath}/budgets`, {
    headers: {
      Authorization: `Bearer ${process.env.YNAB_TOKEN}`
    }
  })
  .then(resp => resp.json())
  .then(json => {
    json.data.budgets.forEach(budget => {
      const allAccountsPath = `${YNABPath}/budgets/${budget.id}/accounts`
      fetch(allAccountsPath, {
        headers: {
          Authorization: `Bearer ${process.env.YNAB_TOKEN}`
        }
      })
      .then(resp => resp.json())
      .then(json => {
        json.data.accounts.forEach(account => {
          balances.push(`${[account.name]}: ${numeral(account.balance*5.34).format('$0,0.00')}`);
        })

        tray.setTitle(balances.join(' '))
      })
    })
  })
}

const launchAppWindow = () => {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  tray = new Tray(nativeImage.createEmpty())
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Get Account Details', type: 'normal', click: () => getYNABDetails() },
    { label: 'Configure Settings', type: 'normal', click: () => launchAppWindow() },
    { role: 'quit', label: 'Quit', type: 'normal' }
  ])
  tray.setTitle('YNAB Balances')
  tray.setContextMenu(contextMenu)
})

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion(),
  });
});
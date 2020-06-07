require('dotenv').config()
const queryString = require('query-string')
const { app, Menu, Tray, nativeImage, BrowserWindow, session } = require('electron')
const numeral = require('numeral')
const { store } = require('../electron/store')
const { authUser, getAccountsAndBalancesForUser } = require('../services/user')
const CronJob = require('cron').CronJob

let tray
let mainWindow
let dynamicMenu = [
  { label: 'Sign Out', type: 'normal', click: () => signOut() },
  { role: 'quit', label: 'Quit', type: 'normal' }
]

const initialMenu = [
  { label: 'Sign In', type: 'normal', click: () => signIn() },
  { role: 'quit', label: 'Quit', type: 'normal' }
]

const signOut = () => {
  store.clear()
  setupTrayAndMenu('Sign in to set up accounts...', initialMenu)
}

const signIn = () => {
  const ynabUrl = `https://app.youneedabudget.com/oauth/authorize?client_id=${process.env.YNAB_CLIENT_ID}&redirect_uri=${process.env.YNAB_REDIRECT_URL}&response_type=code`
  const filter = {
    urls: [process.env.YNAB_REDIRECT_URL + '*']
  }

  session.defaultSession.webRequest.onBeforeRequest(filter, async (details, callback) => {
    const url = details.url
    const values = queryString.parseUrl(url)
    const code = values.query.code

    const isAuth = await authUser(code)

    if(isAuth) {
      // close the window out and update menu with accounts
      if(mainWindow) mainWindow.hide()
      const accounts = await getAccountsAndBalancesForUser()
      parseAccountsForMenu(accounts)
    }
  })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })
  mainWindow.loadURL(ynabUrl)
  mainWindow.on('closed', function () {
    mainWindow.hide()
  })
}

const setAccountAsTitle = (menuItem) => {
  setupTrayAndMenu(menuItem.label, menuItem.menu.items)
}

const getUserAccountsAndSetupMenu = async () => {
  const accounts = await getAccountsAndBalancesForUser()
  parseAccountsForMenu(accounts)
  if(mainWindow) mainWindow.hide()

  // cron for refreshing accounts ever 30 minutes
  const job = new CronJob('*/30 * * * *', function() {
    getUserAccountsAndSetupMenu();
  }, null, true);
  job.start();
}

const parseAccountsForMenu = (accounts) => {
  accounts.forEach((account, i) => {
    dynamicMenu.unshift({
      label: `${[account.name]}: ${numeral(account.balance/1000).format('$0,0.00')}`,
      type: 'normal',
      click: (menuItem) => setAccountAsTitle(menuItem)
    })

    if(accounts.length === i+1) {
      setupTrayAndMenu('Select an account...', dynamicMenu)
      if(mainWindow) mainWindow.hide()
    }
  })
}

const setupTrayAndMenu = (title, menu) => {
  const contextMenu = Menu.buildFromTemplate(menu)
  tray.setTitle(title)
  tray.setContextMenu(contextMenu)
}

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

app.whenReady().then(() => {
  tray = new Tray(nativeImage.createEmpty())
  if(store.get('ynabUserId')) {
    getUserAccountsAndSetupMenu()
  } else {
    setupTrayAndMenu('Sign in to set up accounts...', initialMenu)
  }
})
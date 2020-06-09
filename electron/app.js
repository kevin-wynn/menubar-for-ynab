const { app, Menu, Tray, nativeImage, BrowserWindow, session } = require('electron')
const url = require('url')
const querystring = require('querystring')
const numeral = require('numeral')
const { store } = require('../electron/store')
const { authUser, getAccountsAndBalancesForUser } = require('../services/user')
const CronJob = require('cron').CronJob

let tray
let mainWindow
let chosenAccount
let cronTime = '*/30 * * * *'

const initialMenu = [
  { label: 'Sign In', type: 'normal', click: () => signIn() },
  { role: 'quit', label: 'Quit', type: 'normal' }
]

const signOut = () => {
  store.clear()
  setupTrayAndMenu('Sign in to set up accounts...', initialMenu)
}

const signIn = () => {
  const ynabUrl = `https://app.youneedabudget.com/oauth/authorize?client_id=d2ee67f9fce3706d9c311f6e8b95f15b335f3f3be3b48a3b901a434856ba5f22&redirect_uri=http://localhost/oauth/redirect&response_type=token`
  const filter = {
    urls: [ 'http://localhost/oauth/redirect' ]
  }

  session.defaultSession.webRequest.onBeforeRequest(filter, async (details, callback) => {
    const fragmentParams = querystring.parse(url.parse(details.url).hash.replace('#', ''));
    const isAuth = await authUser(fragmentParams.access_token)

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
    mainWindow = null
  })
}

const setAccountAsTitle = (menuItem) => {
  chosenAccount = menuItem.id
  setupTrayAndMenu(menuItem.label, menuItem.menu.items)
}

const getUserAccountsAndSetupMenu = async () => {
  const accounts = await getAccountsAndBalancesForUser()
  parseAccountsForMenu(accounts)
  if(mainWindow) mainWindow.hide()

  // cron for refreshing accounts ever 30 minutes
  const job = new CronJob(cronTime, function() {

    getUserAccountsAndSetupMenu();
  }, null, true);
  job.start();
}

const parseAccountsForMenu = (accounts) => {
  let dynamicMenu = [
    { label: 'Sign Out', type: 'normal', click: () => signOut() },
    { role: 'quit', label: 'Quit', type: 'normal' }
  ]

  accounts.forEach((account, i) => {
    if(chosenAccount && account.name === chosenAccount) {
      chosenAccount = `${[account.name]}: ${numeral(account.balance/1000).format('$0,0.00')}`
    }

    dynamicMenu.unshift({
      id: account.name,
      label: `${[account.name]}: ${numeral(account.balance/1000).format('$0,0.00')}`,
      type: 'normal',
      click: (menuItem) => setAccountAsTitle(menuItem)
    })

    if(accounts.length === i+1) {
      setupTrayAndMenu(chosenAccount ? chosenAccount : 'Select an account...', dynamicMenu)
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
const fetch = require('node-fetch')
const { store } = require('../electron/store')
const YNABPath = 'https://api.youneedabudget.com/v1'

const authUser = async (code) => {
  let user = {}

  const YNABAuthUrl = `https://app.youneedabudget.com/oauth/token?client_id=${process.env.YNAB_CLIENT_ID}&client_secret=${process.env.YNAB_CLIENT_SECRET}&redirect_uri=${process.env.YNAB_REDIRECT_URL}&grant_type=authorization_code&code=${code}`

  const response = await fetch(YNABAuthUrl, { method: 'POST' })
  const authJson = await response.json()


  user['acessToken'] = authJson.access_token
  user['refreshToken'] = authJson.refresh_token

  const userDetailsResponse = await fetch(`${YNABPath}/user`, {
      headers: {
        Authorization: `Bearer ${authJson.access_token}`
      }
    })

  const userDetailsJson = await userDetailsResponse.json()

  user['ynabUserId'] = userDetailsJson.data.user.id

  store.set('ynabUserId', user.ynabUserId)
  store.set('accessToken', user.acessToken)
  store.set('refreshToken', user.refreshToken)

  return true
}

const getAccountsAndBalancesForUser = async () => {
  const userAccounts = await fetch(`${YNABPath}/budgets/default/accounts`, {
    headers: {
      Authorization: `Bearer ${store.get('accessToken')}`
    }
  })

  const accountsJson = await userAccounts.json();
  return accountsJson.data.accounts
}

module.exports = {
  authUser: authUser,
  getAccountsAndBalancesForUser: getAccountsAndBalancesForUser
}
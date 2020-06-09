const fetch = require('node-fetch')
const { store } = require('../electron/store')
const YNABPath = 'https://api.youneedabudget.com/v1'

const authUser = async (access_token) => {
  const userDetailsResponse = await fetch(`${YNABPath}/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

  const userDetailsJson = await userDetailsResponse.json()
  store.set('ynabUserId', userDetailsJson.data.user.id)
  store.set('accessToken', access_token)
  return true
}

const getAccountsAndBalancesForUser = async () => {
  const userAccounts = await fetch(`${YNABPath}/budgets/default/accounts`, {
    headers: {
      Authorization: `Bearer ${store.get('accessToken')}`
    }
  })

  const accountsJson = await userAccounts.json()
  return accountsJson.data.accounts
}

module.exports = {
  authUser: authUser,
  getAccountsAndBalancesForUser: getAccountsAndBalancesForUser
}
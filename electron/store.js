const Store = require('electron-store')

const schema = {
  ynabUserId: {
    type: 'string'
  },
  accessToken: {
    type: 'string'
  },
  refreshToken: {
    type: 'string'
  }
}

const store = new Store(schema);

module.exports = {
  store: store
}
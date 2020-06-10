require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const fetch = require('node-fetch')
const port = process.env.PORT || 8080

const userSchema = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  expires_in: Number,
  token_type: String
})

const User = mongoose.model('User', userSchema)

const app = express()

mongoose.connect(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

app.get('/auth/:code', async (req, res) => {
  const ynabURL = `https://app.youneedabudget.com/oauth/token?client_id=${process.env.YNAB_CLIENT_ID}&client_secret=${process.env.YNAB_SECRET_ID}&redirect_uri=${process.env.YNAB_REDIRECT_URL}&grant_type=authorization_code&code=${req.params.code}`
  const response = await fetch(ynabURL, { method: 'POST' })
  const json = await response.json()
  const newUser = new User(json.data)
  const savedUser = await newUser.save()


})

app.listen(port, () => console.log(`YNAB Menubar server running on port:${port}`))

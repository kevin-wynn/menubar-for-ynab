# Menubar for YNAB

A simple lightweight menubar application designed to show you the current balance of your YNAB accounts, updated every 30 minutes.

## Installation

Download our installer (mac support only at this time):

[v0.1.0-alpha](https://github.com/kevin-wynn/menubar-for-ynab/releases/download/v0.1.0-alpha/Menubar.for.YNAB-0.1.0.dmg)

## Development

To get this project set up locally clone it down and `yarn install`

You will need to create a `.env` file that contains your client ID and Secret from YNAB

```
YNAB_CLIENT_ID=<<YOUR YNAB CLIENT ID>>
YNAB_REDIRECT_URL=<<YOUR YNAB REDIRECT URL>>
```

In your terminal run `yarn start` to start the electron app.

Work in your own branch off `master` and put in a pull request for any new features or work.
| [privacy page](https://kevin-wynn.github.io/menubar-for-ynab/privacy) | [releases and updates](https://kevin-wynn.github.io/menubar-for-ynab/changes)

## Installation

Download our installer (mac support only at this time):

[v0.1.0-alpha](https://github.com/kevin-wynn/menubar-for-ynab/releases/download/v0.1.0-alpha/Menubar.for.YNAB-0.1.0.dmg)

[v0.1.1-alpha](https://github.com/kevin-wynn/menubar-for-ynab/releases/download/v0.1.1-alpha/Menubar.for.YNAB-0.1.1.dmg)

## Development

To get this project set up locally clone it down and `yarn install`

You will need to create a `.env` file that contains your client ID and Secret from YNAB

```
YNAB_CLIENT_ID=<<YOUR YNAB CLIENT ID>>
YNAB_REDIRECT_URL=<<YOUR YNAB REDIRECT URL>>
```

In your terminal run `yarn start` to start the electron app.

Work in your own branch off `master` and put in a pull request for any new features or work.
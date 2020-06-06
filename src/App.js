import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { channels } from './constants';
import './App.css';

const { ipcRenderer } = window;

function App() {
  const [appName, setAppName] = useState('');
  const [appVersion, setAppVersion] = useState('');
  ipcRenderer.send(channels.APP_INFO);

  ipcRenderer.on(channels.APP_INFO, (event, arg) => {
    ipcRenderer.removeAllListeners(channels.APP_INFO);
    const { appName, appVersion } = arg;
    setAppName(appName);
    setAppVersion(appVersion)
  });

  return (
    <div className="App">
      <Router>
        <div className="sidebar">
          <ul className="sidebar">
            <li>
              <Link to="/">Settings</Link>
            </li>
            <li>
              <Link to="/accounts">Accounts</Link>
            </li>
            <li>
              <Link to="/auth">Authorization</Link>
            </li>
          </ul>
          <div className="signout">
            <Link to="/signout">Sign out</Link>
            <p className="version-text">{appName} running on version {appVersion}</p>
          </div>
        </div>
        <Switch>
          <div className="content">
            <Route exact path="/">
              <div className="home">
                <h1>Settings</h1>
              </div>
            </Route>
            <Route exact path="/accounts">
              <div className="accounts">
                <h1>Accounts</h1>
              </div>
            </Route>
            <Route exact path="/auth">
              <div className="auth">
                <h1>Authorization</h1>
              </div>
            </Route>
          </div>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

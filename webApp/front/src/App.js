import React, { Component } from "react";
import Main from "./components/Main";
import Masking from "./components/Insurance";
import Mapping from "./components/Arbitrar";
import { Switch, Route, HashRouter } from "react-router-dom";

class App extends Component {
  state = {}

  render() {
    return (
      <HashRouter>
        <Main />
        <Switch>
          <Route path="/insurance">
            <Masking/>
          </Route>
          <Route path="/arbitrar">
            <Mapping/>
          </Route>
        </Switch>
      </HashRouter>
    );
  }
}

export default App;

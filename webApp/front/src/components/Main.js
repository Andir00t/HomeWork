import React, { Component } from "react";
import "../App.css";
import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiTitle,
  EuiNavDrawerGroup,
  EuiNavDrawer,
  EuiHeaderLogo,
} from "@elastic/eui/lib";


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.exploreLinks = [
      {
        label: "Приложение страховой",
        href:  "#/insurance",
        iconType: "heartbeatApp",
        isActive: true
      },
      {
        label: "Приложение арбитра",
        href:  "#/arbitrar",
        iconType: "securityApp",
        isActive: true
      }
    ];
  }

  render() {
    return (
      <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '40px',
              width: '100%',
              zIndex: 1000
            }}>
        <EuiHeader>
          <EuiHeaderSection grow={true}>
            <EuiHeaderSectionItem border="right">
            <EuiHeaderLogo iconType="faceHappy" href="#/"/>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
          <EuiHeaderSection>
            <EuiHeaderSectionItem side="right" border="right">
              <EuiTitle>
                <h1>Home Work 0.1&nbsp;&nbsp;&nbsp;</h1>
              </EuiTitle>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </EuiHeader>
        <EuiNavDrawer showExpandButton={false}>
          <EuiNavDrawerGroup listItems={this.exploreLinks} />
        </EuiNavDrawer>
      </div>
    );
  }
}

export default Main;

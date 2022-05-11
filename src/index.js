import React from "react";
import ReactDOM from "react-dom";
// import './index.css';
// import 'antd/dist/antd.css'
import "antd/dist/antd.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { SimpleUserProvider } from "./context/SimpleUserContext";
import { PhoneStatusProvider } from "./context/PhoneStatusContext";
import { ConferenceStatusProvider } from "./context/ConferenceStatusContext";
import AuthContext, { AuthProvider } from "./context/AuthenContext";
import { VideoLayoutProvider } from "./context/VideoContext";
import { RecentCallListProvider } from "./context/RecentCallListContext";
import { InviterUserProvider } from "./context/InviterUserContext";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <PhoneStatusProvider>
        <ConferenceStatusProvider>
        <SimpleUserProvider>
          <InviterUserProvider>
            <RecentCallListProvider>
              <VideoLayoutProvider>
                <App />
              </VideoLayoutProvider>
            </RecentCallListProvider>
          </InviterUserProvider>
        </SimpleUserProvider>
        </ConferenceStatusProvider>
      </PhoneStatusProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

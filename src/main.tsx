import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { PaymentQR } from './app/pages/PaymentQR';
import { OrderTracking } from './app/pages/OrderTracking'; 

ReactDOM.createRoot(document.getElementById("root")!).render(
      <App />
);
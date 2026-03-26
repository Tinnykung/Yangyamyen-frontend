import { createBrowserRouter } from "react-router-dom";
import { Root } from "./pages/Root";
import { Menu } from "./pages/Menu";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { Kitchen } from './pages/Kitchen';
import { Cashier } from './pages/Cashier';
import { PaymentQR } from "./pages/PaymentQR";
import { OrderTracking } from './pages/OrderTracking'; 

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Menu },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "confirmation", Component: OrderConfirmation },
      { path: "kitchen", Component: Kitchen },
      { path: "cashier", Component: Cashier },
      { path: '/payment/:tableNumber', Component: PaymentQR },
      { path: '/tracking', Component: OrderTracking },
    ],
  },
]);

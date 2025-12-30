// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Catering from "@/pages/Catering";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import Order from "@/pages/Order";
import UserDashboard from "@/pages/dashboard/UserDashboard";
import { RequireAuth, RequireAdmin } from "./guards";

// Admin shell + pages
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminMessages from "@/pages/admin/AdminMessages";   // dY`^ NEW
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import MyOrders from "@/pages/dashboard/MyOrders";
import OrderDetails from "@/pages/dashboard/OrderDetails";

export const router = createBrowserRouter([
  // Public + customer area (with Main nav)
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/menu", element: <Menu /> },
      { path: "/catering", element: <Catering /> },
      { path: "/gallery", element: <Gallery /> },
      { path: "/contact", element: <Contact /> },

      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      {
        path: "/checkout/success",
        element: <CheckoutSuccess />,
      },
      {
        path: "/dashboard/my-orders",
        element: <MyOrders />,
      },
      {
        element: <RequireAuth />,
        children: [
          { path: "/order", element: <Order /> },
          { path: "/dashboard", element: <UserDashboard /> },
          { path: "/dashboard/order", element: <OrderDetails /> },
          { path: "/dashboard/order/:orderId", element: <OrderDetails /> },
        ],
      },
    ],
  },

  // Admin area (NO MainLayout)
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />, // dedicated shell with left sidebar
        children: [
          { index: true, element: <AdminOverview /> },
          { path: "users", element: <AdminUsers /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "menu", element: <AdminMenu /> },
          { path: "messages", element: <AdminMessages /> }, // dY`^ NEW
        ],
      },
    ],
  },
]);

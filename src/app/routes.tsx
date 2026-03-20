import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { FormBuilder } from "./pages/FormBuilder";
import { QRCodeView } from "./pages/QRCodeView";
import { DataViewer } from "./pages/DataViewer";
import { PublicForm } from "./pages/PublicForm";
import Login from "./pages/Login";
import { useAuth } from "./utils/auth";
import { MainLayout } from "./components/MainLayout";
import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/form/new",
    element: <ProtectedRoute><FormBuilder /></ProtectedRoute>,
  },
  {
    path: "/form/edit/:formId",
    element: <ProtectedRoute><FormBuilder /></ProtectedRoute>,
  },
  {
    path: "/form/:formId/qr",
    element: <ProtectedRoute><QRCodeView /></ProtectedRoute>,
  },
  {
    path: "/form/:formId/data",
    element: <ProtectedRoute><DataViewer /></ProtectedRoute>,
  },
  {
    path: "/f/:formId",
    element: <PublicForm />,
  },
]);

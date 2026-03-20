import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { FormBuilder } from "./pages/FormBuilder";
import { QRCodeView } from "./pages/QRCodeView";
import { DataViewer } from "./pages/DataViewer";
import { PublicForm } from "./pages/PublicForm";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/form/new",
    Component: FormBuilder,
  },
  {
    path: "/form/edit/:formId",
    Component: FormBuilder,
  },
  {
    path: "/form/:formId/qr",
    Component: QRCodeView,
  },
  {
    path: "/form/:formId/data",
    Component: DataViewer,
  },
  {
    path: "/f/:formId",
    Component: PublicForm,
  },
]);

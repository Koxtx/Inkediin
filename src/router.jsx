import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Homepage from "./pages/Homepage/Homepage";
import ErrorPage from "./pages/ErrorPages";
import UserConnected from "./components/ProtectedRoutes/UserConnected";
import UserNotConnected from "./components/ProtectedRoutes/UserNotConnected";
import Feed from "./pages/Feed/Feed";
import Exploration from "./pages/Exploration/Exploration";
import Messagerie from "./pages/Messagerie/Messagerie";
import Notification from "./pages/notifications/Notification";
import Conversation from "./pages/Messagerie/components/Conversation";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/feed",
        element: <Feed />,
      },
      {
        path: "/exploration",
        element: <Exploration />,
      },
      {
        path: "/messagerie",
        element: <Messagerie />,
      },
      {
        path: "/notification",
        element: <Notification />,
      },
      {
        path: "/conversation",
        element: <Conversation />,
      },
    ],
  },
]);

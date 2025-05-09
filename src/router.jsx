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
import Wishlist from "./pages/Wishlist/Wishlist";
import ProfilTatoueur from "./pages/ProfilTatoueur/ProfilTatoueur";
import ProfilClient from "./pages/ProfilClient/ProfilClient";
import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      {
        path: "/signup",
        element: (
          <UserNotConnected>
            <SignUp />
          </UserNotConnected>
        ),
      },
      {
        path: "/signin",
        element: (
          <UserNotConnected>
            <SignIn />
          </UserNotConnected>
        ),
      },

      {
        path: "/tatoueur",
        element: (
          <UserConnected>
            <Homepage />
          </UserConnected>
        ),
      },
      {
        path: "/",
        element: (
          <UserConnected>
            <Feed />
          </UserConnected>
        ),
      },
      {
        path: "/exploration",
        element: (
          <UserConnected>
            <Exploration />
          </UserConnected>
        ),
      },
      {
        path: "/messagerie",
        element: (
          <UserConnected>
            <Messagerie />
          </UserConnected>
        ),
      },
      {
        path: "/notification",
        element: (
          <UserConnected>
            <Notification />
          </UserConnected>
        ),
      },
      {
        path: "/conversation",
        element: (
          <UserConnected>
            <Conversation />
          </UserConnected>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <UserConnected>
            <Wishlist />
          </UserConnected>
        ),
      },
      {
        path: "/profiltatoueur",
        element: (
          <UserConnected>
            <ProfilTatoueur />
          </UserConnected>
        ),
      },
      {
        path: "/profilclient",
        element: (
          <UserConnected>
            <ProfilClient />
          </UserConnected>
        ),
      },
    ],
  },
]);

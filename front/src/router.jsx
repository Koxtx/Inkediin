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
import Tag from "./pages/Tags/Tag";
import Support from "./pages/Support/Support";
import StatTatoueur from "./pages/Statistiques/StatTatoueur";
import MentionLegal from "./pages/MentionLegal/MentionLegal";
import CustomProjet from "./pages/ProjetsPerso/CustomProjet";
import PortFolioManagement from "./pages/Portfolio/PortFolioManagement";
import Promotion from "./pages/Promotion/Promotion";
import RecommandationPerso from "./pages/Recommandation/RecommandationPerso";
import Tips from "./pages/Recommandation/Tips";
import Reservation from "./pages/Réservation/Reservation";
import historiqueReserve from "./pages/Réservation/historiqueReserve";
import FlashDetail from "./pages/flash/FlashDetail";
import FlashUploadPage from "./pages/flash/FlashUploadPage";
import ProfilTatoueur from "./pages/ProfilTatoueur/ProfilTatoueur";
import ProfilClient from "./pages/ProfilClient/ProfilClient";
import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";
import ParametreCompte from "./pages/Parametres/ParametreCompte";

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
      {
        path: "/tag",
        element: <Tag />,
      },
      {
        path: "/stat",
        element: <StatTatoueur />,
      },
      {
        path: "/mentionlegal",
        element: <MentionLegal />,
      },
      {
        path: "/customprojet",
        element: <CustomProjet />,
      },
      {
        path: "/portfoliomanage",
        element: <PortFolioManagement />,
      },
      {
        path: "/promotion",
        element: <Promotion />,
      },
      {
        path: "/recoperso",
        element: <RecommandationPerso />,
      },
      {
        path: "/tips",
        element: <Tips />,
      },
      {
        path: "/reservation",
        element: <Reservation />,
      },
      {
        path: "/historiquereserve",
        element: <historiqueReserve />,
      },
      {
        path: "/flashdetail",
        element: <FlashDetail />,
      },
      {
        path: "/flashupload",
        element: <FlashUploadPage />,
      },
      {
        path: "/support",
        element: <Support />,
      },
        {
        path: "/param",
        element: <ParametreCompte />,
      },
    ],
  },
]);

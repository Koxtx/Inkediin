import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Homepage from "./pages/Homepage/Homepage";
import ErrorPage from "./pages/ErrorPages";
import UserConnected from "./components/ProtectedRoutes/UserConnected";
import UserNotConnected from "./components/ProtectedRoutes/UserNotConnected";
import ProtectedSetupRoute from "./components/ProtectedRoutes/ProtectedSetupRoute";
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
import Profil from "./pages/Profil/Profil";

import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";
import ParametreCompte from "./pages/Parametres/ParametreCompte";
import SetupProfil from "./pages/Auth/SetupProfil";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import PublicationUploadPage from "./pages/Feed/PublicationUploadPage";
import FlashEdit from "./pages/flash/FlashEdit";
import FlashManagementPage from "./pages/Profil/components/FlashManagement";
import ModifierProfil from "./pages/Parametres/components/ModifierProfil";

// ✅ AJOUT: Import du composant PostDetail
import PostDetail from "./pages/Feed/PostDetail";

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
        path: "/forgotpassword",
        element: (
          <UserNotConnected>
            <ForgotPassword />
          </UserNotConnected>
        ),
      },
      {
        path: "/resetpassword/:token",
        element: (
          <UserNotConnected>
            <ResetPassword />
          </UserNotConnected>
        ),
      },
      // Route protégée pour le setup de profil
      {
        path: "/setupprofil",
        element: (
          <ProtectedSetupRoute>
            <SetupProfil />
          </ProtectedSetupRoute>
        ),
      },
      // Toutes les autres routes nécessitent un profil complet
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
        path: "/conversation/:id",
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
        path: "/profil",
        element: (
          <UserConnected>
            <Profil />
          </UserConnected>
        ),
      },
      {
        path: "/profil/:id",
        element: (
          <UserConnected>
            <Profil />
          </UserConnected>
        ),
      },
      {
        path: "/tag",
        element: (
          <UserConnected>
            <Tag />
          </UserConnected>
        ),
      },
      {
        path: "/stat",
        element: (
          <UserConnected>
            <StatTatoueur />
          </UserConnected>
        ),
      },
      {
        path: "/mentionlegal",
        element: (
          <UserConnected>
            <MentionLegal />
          </UserConnected>
        ),
      },
      {
        path: "/customprojet",
        element: (
          <UserConnected>
            <CustomProjet />
          </UserConnected>
        ),
      },
      {
        path: "/portfoliomanage",
        element: (
          <UserConnected>
            <PortFolioManagement />
          </UserConnected>
        ),
      },
      {
        path: "/promotion",
        element: (
          <UserConnected>
            <Promotion />
          </UserConnected>
        ),
      },
      {
        path: "/recoperso",
        element: (
          <UserConnected>
            <RecommandationPerso />
          </UserConnected>
        ),
      },
      {
        path: "/tips",
        element: (
          <UserConnected>
            <Tips />
          </UserConnected>
        ),
      },
      {
        path: "/reservation",
        element: (
          <UserConnected>
            <Reservation />
          </UserConnected>
        ),
      },
      {
        path: "/historiquereserve",
        element: (
          <UserConnected>
            <historiqueReserve />
          </UserConnected>
        ),
      },
      // ✅ ROUTE EXISTANTE: FlashDetail avec paramètre ID (déjà corrigée)
      {
        path: "/flashdetail/:id",
        element: (
          <UserConnected>
            <FlashDetail />
          </UserConnected>
        ),
      },
      {
        path: "/flashupload",
        element: (
          <UserConnected>
            <FlashUploadPage />
          </UserConnected>
        ),
      },
      {
        path: "/support",
        element: (
          <UserConnected>
            <Support />
          </UserConnected>
        ),
      },
      {
        path: "/param",
        element: (
          <UserConnected>
            <ParametreCompte />
          </UserConnected>
        ),
      },
      {
        path: "/uploadpublication",
        element: (
          <UserConnected>
            <PublicationUploadPage />
          </UserConnected>
        ),
      },
      {
        path: "/flashedit/:flashId",
        element: (
          <UserConnected>
            <FlashEdit />
          </UserConnected>
        ),
      },
      {
        path: "/flashs",
        element: (
          <UserConnected>
            <FlashManagementPage />
          </UserConnected>
        ),
      },
      {
        path: "/modifierprofil",
        element: (
          <UserConnected>
            <ModifierProfil />
          </UserConnected>
        ),
      },
      // ✅ AJOUT: Nouvelle route pour le détail de post
      {
        path: "/post/:id",
        element: (
          <UserConnected>
            <PostDetail />
          </UserConnected>
        ),
      },
    ],
  },
]);
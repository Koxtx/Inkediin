import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "./components/providers/ThemeProvider";
import AuthProvider from "./components/providers/AuthProvider";
import Header from "./components/header/Header";
import FlashProvider from "./components/providers/FlashProvider";
import MessagerieProvider from "./components/providers/MessagerieProvider";
import PromotionProvider from "./components/providers/PromotionProvider";
import NotifProvider from "./components/providers/NotifProvider";
import PublicationProvider from "./components/providers/PublicationProvider";
import { SocketProvider } from "./components/providers/SocketProvider";

function App() {
  const location = useLocation();

  // Pages publiques qui n'ont pas besoin de tous les providers
  const isPublicPage = ["/signin", "/signup", "/forgotpassword"].some((path) =>
    location.pathname.startsWith(path)
  );

  console.log(
    "🔄 App render - path:",
    location.pathname,
    "isPublic:",
    isPublicPage
  );

  if (isPublicPage) {
    // Layout simplifié pour les pages publiques
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 text-black dark:bg-prim dark:text-white w-full">
        <ThemeProvider>
          <AuthProvider>
            <main className="flex-1 w-full">
              <Outlet />
            </main>
            <ScrollRestoration />
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </div>
    );
  }

  // Layout complet pour les pages privées
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black dark:bg-prim dark:text-white w-full">
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotifProvider>
              <PublicationProvider>
                <FlashProvider>
                  <MessagerieProvider>
                    <PromotionProvider>
                      <div className="w-full flex flex-col md:flex-row">
                        <Header />
                        <div className="flex flex-col flex-1 w-full md:ml-64  md:mt-0 pb-20 md:pb-0">
                          <main className="flex-1 w-full">
                            <Outlet />
                          </main>
                        </div>
                      </div>
                      <ScrollRestoration />
                    </PromotionProvider>
                  </MessagerieProvider>
                </FlashProvider>
              </PublicationProvider>
            </NotifProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
    </div>
  );
}

export default App;

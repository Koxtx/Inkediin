import { Outlet, ScrollRestoration } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "./components/providers/ThemeProvider";
import AuthProvider from "./components/providers/AuthProvider";
import Header from "./components/header/Header";
import ProfilProvider from "./components/providers/ProfilProvider";
import FlashProvider from "./components/providers/FlashProvider";
import MessagerieProvider from "./components/providers/MessagerieProvider";
import PromotionProvider from "./components/providers/PromotionProvider";
import SearchProvider from "./components/providers/SearchProvider";
import NotifProvider from "./components/providers/NotifProvider";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-prim dark:text-white w-full">
      <ThemeProvider>
        <AuthProvider>
          <NotifProvider>
            <ProfilProvider>
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
            </ProfilProvider>
          </NotifProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
    </div>
  );
}

export default App;

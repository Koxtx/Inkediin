import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Homepage from "./pages/Homepage/Homepage";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <UserConnected>
            <Homepage />
          </UserConnected>
        ),
      },
    ],
  },
]);

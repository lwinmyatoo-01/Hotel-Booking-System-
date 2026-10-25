import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from './components/UserContext.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import AuthForm from './components/AuthForm.jsx';
import BookingComponent from './components/BookingComponent.jsx';

// ADD THIS LINE (Adjust the path if AllRooms is inside a different folder)
import AllRooms from './components/AllRooms.jsx'; 
import OccupiedDatesDisplay from './components/OccupiedDatesDisplay.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <BookingComponent /> },
      {
        path: "/auth",
        element: (
          <GuestRoute>
            <AuthForm />
          </GuestRoute>
        )
      },
      {
        path: "/all-rooms",
        element: <AllRooms />,
      },
      {
        path: "/my-bookings",
        element: <OccupiedDatesDisplay/>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);
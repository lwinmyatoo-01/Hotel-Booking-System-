import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { children, useContext } from "react";

const GuestRoute = ({children}) => {
    const { user } = useContext(UserContext);

    //if user is authenticated, redirect to home
    if (user){
        return <Navigate to="/"></Navigate>;
    }

    return children;
};

export default GuestRoute;
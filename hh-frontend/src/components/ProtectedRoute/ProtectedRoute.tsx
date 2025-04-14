import {Navigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {ReactNode} from "react";

const ProtectedRoute = ({children, redirect = "/"}: {children: ReactNode, redirect?: string}) => {
    const {accessToken} = useAuth();

    if(!accessToken) {
        return <Navigate to={redirect} replace />
    }
    console.log(children);
    return children;
}

export default ProtectedRoute;
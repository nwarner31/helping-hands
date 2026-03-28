import {Navigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import React from "react";


const ProtectedRoute = ({ redirect = "/", children, rolesAllowed}: {redirect?: string, children?: React.ReactNode, rolesAllowed?: string[]}) => {
    const {accessToken, employee} = useAuth();
    if(!accessToken) {
        return <Navigate to={redirect} replace />
    }
    if(rolesAllowed && !rolesAllowed.includes(employee?.position as string)) {
        console.log(employee?.position);
        return <Navigate to={redirect} replace />
    }
    return (<>{children}</>);
}

export default ProtectedRoute;
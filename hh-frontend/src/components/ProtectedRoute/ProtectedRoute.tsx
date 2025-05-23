import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";


const ProtectedRoute = ({ redirect = "/"}: {redirect?: string}) => {
    const {accessToken} = useAuth();

    if(!accessToken) {
        return <Navigate to={redirect} replace />
    }
    return <Outlet />;
}

export default ProtectedRoute;
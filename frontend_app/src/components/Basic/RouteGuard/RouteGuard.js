import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";

export const RouteGuard = ({ children }) => {
    const { isAuthenticated } = useAuthContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

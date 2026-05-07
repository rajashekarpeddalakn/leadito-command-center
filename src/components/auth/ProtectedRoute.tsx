import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("userToken");
    const location = useLocation();

    if (!token) {
        // Redirect them to the /auth page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

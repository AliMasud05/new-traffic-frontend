import AuthContext from "@/Context/Contex";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
    // Or use your preferred loading indicator
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default PrivateRoute;
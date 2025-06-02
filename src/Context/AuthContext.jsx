import { useEffect, useState } from "react";
import AuthContext from "./Contex";

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Verify token with backend if needed
          // const isValid = await verifyToken(token);
          // For now, we'll assume token is valid if it exists
          setIsAuthenticated(true);
          
          const userData = localStorage.getItem("user");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user,
        loading,
        login, 
        logout,
        setIsAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "@/Context/Contex";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await axios.post(
        "https://traffic-solve-cors-backend.vercel.app/api/users/login",
        { email, password }
      );

      console.log("Full API response:", res.data); // Debugging

      // Handle different response structures
      const token = res.data.token || res.data?.data?.token || res.data.accessToken;
      
      if (!token) {
        throw new Error(
          res.data.message || 
          "Authentication successful but no token received. Please check your API response format."
        );
      }

      // Extract user data if available
      const userData = res.data.user || res.data?.data?.user || {
        email: email,
        // Add other user fields you might need
      };

      login(token, userData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Full login error:", error);
      
      // Improved error message handling
      let errorMessage = "Login failed. Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="p-5 bg-gray-200 rounded shadow w-80">
        <h2 className="mb-3 text-xl font-bold">Admin Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        
        {error && (
          <p className="text-red-500 text-sm mb-2">
            {typeof error === 'string' ? error : "Unexpected error occurred"}
          </p>
        )}
        
        <button 
          type="submit" 
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">↻</span>
              Logging in...
            </>
          ) : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
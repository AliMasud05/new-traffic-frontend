import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Users, HelpCircle, LogOut, Menu, X } from "lucide-react";





import Admin from "./Admin/Admin";
import AdminQuestions from "./Admin/AdminQuestions";
import { ToastContainer } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("admin");
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");


  const [questionTabActive, setQuestionTabActive] = useState("all");


  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".menu-button")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <ToastContainer
        className="toast-position"
        position="top-center"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* Mobile Header with Menu */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <button
          onClick={toggleSidebar}
          className="focus:outline-none menu-button"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - responsive height and toggle management */}
      <div
        className={`sidebar ${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-72 h-64 md:h-full bg-[#2C3930] text-white p-5 flex flex-col ${
          sidebarOpen ? "absolute z-10 top-16 bottom-0" : ""
        } md:relative md:top-0`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center hidden md:block">
          Dashboard
        </h2>
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => {
              setActiveTab("admin");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 my-2 rounded transition-all ${
              activeTab === "admin" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Users className="mr-3" /> Admins
          </button>
          <button
            onClick={() => {
              setActiveTab("question");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 my-2 rounded transition-all ${
              activeTab === "question" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <HelpCircle className="mr-3" /> Questions
          </button>
          <button
            onClick={handleLogout}
            className="w-full mt-auto flex items-center p-3 bg-red-600 hover:bg-red-700 rounded transition-all"
          >
            <LogOut className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto bg-[#F8E7F6]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {activeTab === "admin" && (
             
              <>
                <Admin />
              </>
            )}
            {activeTab === "question" && (
            
              <>
                <div className="flex space-x-4 mb-5">
                  <button
                    onClick={() => setQuestionTabActive("all")}
                    className={`p-2 rounded-sm ${
                      questionTabActive === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    All Questions
                  </button>
                  <button
                    onClick={() => setQuestionTabActive("create")}
                    className={`p-2 rounded-sm ${
                      questionTabActive === "create"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Create Question
                  </button>
                  <button
                    onClick={() => setQuestionTabActive("topics")}
                    className={`p-2 rounded-sm ${
                      questionTabActive === "topics"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Vehicle & Topics
                  </button>
                </div>

                <AdminQuestions
                  questionTabActive={questionTabActive}
                  setQuestionTabActive={setQuestionTabActive}
                  loading={loading}
                  setLoading={setLoading}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

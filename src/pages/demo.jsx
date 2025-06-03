// import React, { useEffect, useState } from "react";

// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Users, HelpCircle, LogOut, Menu, X } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import { use } from "react";

// import { Button } from "@/components/ui/button";
// import AdminTopics from "./AdminTopics";
// import CreateQuestion from "./CreateQuestion";
// const AdminQuestions = () => {
//   const navigate = useNavigate();
//   const [admins, setAdmins] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [filteredQuestions, setFilteredQuestions] = useState([]);
//   const [activeTab, setActiveTab] = useState("admin");
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const token = localStorage.getItem("token");

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("admin");
//   const [questionText, setQuestionText] = useState("");
//   const [options, setOptions] = useState(["", "", "", ""]);
//   const [correctOption, setCorrectOption] = useState(0);
//   const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("all");
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [topicField, setTopicField] = useState("");
//   const [questionTabActive, setQuestionTabActive] = useState("all");
//   const [oldPassword, setOldPassword] = useState("");
//   const [editAdmin, setEditAdmin] = useState(false);
//   const [userName, setUserName] = useState("");
//   const [topics, setTopics] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const questionsPerPage = 10;

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//     } else {
//       fetchQuestions();
//     }
//   }, [token, navigate]);

//   // Close sidebar when clicking outside on mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         sidebarOpen &&
//         !event.target.closest(".sidebar") &&
//         !event.target.closest(".menu-button")
//       ) {
//         setSidebarOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [sidebarOpen]);

//   // Topics

//   // Questions

//   const fetchQuestions = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "http://localhost:4000/questions/all-questions"
//       );
//       setQuestions(response.data);
//       setFilteredQuestions(response.data);
//     } catch (error) {
//       console.error("Failed to fetch questions", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteQuestion = async (id) => {
//     try {
//       await axios.delete(
//         `http://localhost:4000/questions/delete-question/${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       fetchQuestions();
//     } catch (error) {
//       console.error("Failed to delete question", error);
//     }
//   };




//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     const filtered = questions.filter((question) =>
//       question.question.toLowerCase().includes(e.target.value.toLowerCase())
//     );
//     setFilteredQuestions(filtered);
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const filterQuestionsByTopic = (topic) => {
//     setSelectedTopic(topic);
//     if (topic === "all") {
//       setFilteredQuestions(questions);
//     } else {
//       const filtered = questions.filter(
//         (question) => question.topics === topic
//       );
//       setFilteredQuestions(filtered);
//     }
//   };

//   const uniqueTopics = [
//     ...new Set(questions.map((question) => question.topics)),
//   ];

//   const indexOfLastQuestion = currentPage * questionsPerPage;
//   const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
//   const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

//   const nextPage = () => {
//     if (currentPage < Math.ceil(filteredQuestions.length / questionsPerPage)) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };


//   return (
//     <div>
//       {" "}
//       <>
//         <div className="flex space-x-4 mb-5">
//           <button
//             onClick={() => setQuestionTabActive("all")}
//             className={`p-2 ${
//               questionTabActive === "all"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             All Questions
//           </button>
//           <button
//             onClick={() => setQuestionTabActive("create")}
//             className={`p-2 ${
//               questionTabActive === "create"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Create Question
//           </button>
//           <button
//             onClick={() => setQuestionTabActive("topics")}
//             className={`p-2 ${
//               questionTabActive === "topics"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Topics Management
//           </button>
//         </div>

//         {questionTabActive === "all" && (
        
//         )}

//         {questionTabActive === "create" && (
//           <div>
//             <CreateQuestion />
//           </div>
//         )}

//         {questionTabActive === "topics" && <AdminTopics />}
//       </>
//     </div>
//   );
// };

// export default AdminQuestions;


// import React, { useState } from "react";
// import { Menu, X } from "lucide-react";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false); // State to manage responsive nav visibility

//   const toggleNav = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <nav className="bg-white shadow-md fixed w-full z-50">
//       {/* Desktop Navbar */}
//       <div className="container mx-auto px-4 py-3 flex justify-between items-center">
//         {/* Logo */}
//         <div className="text-xl font-bold text-blue-600">MyLogo</div>

//         {/* Desktop Nav Links */}
//         <div className="hidden md:flex space-x-6">
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             Home
//           </a>
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             About
//           </a>
//           <DropdownMenu>
//             <DropdownMenuTrigger className="text-gray-700 hover:text-blue-600 focus:outline-none">
//               Services
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem>Web Development</DropdownMenuItem>
//               <DropdownMenuItem>Mobile Development</DropdownMenuItem>
//               <DropdownMenuItem>SEO</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             Contact
//           </a>
//         </div>

//         {/* Mobile Menu Button */}
//         <button onClick={toggleNav} className="md:hidden text-gray-700 focus:outline-none">
//           <Menu size={24} />
//         </button>
//       </div>

//       {/* Responsive Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } md:hidden z-50`}
//       >
//         {/* Close Button */}
//         <div className="flex justify-end p-4">
//           <button onClick={toggleNav} className="text-gray-700 focus:outline-none">
//             <X size={24} />
//           </button>
//         </div>

//         {/* Mobile Nav Links */}
//         <div className="flex flex-col space-y-4 p-4">
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             Home
//           </a>
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             About
//           </a>
//           <DropdownMenu>
//             <DropdownMenuTrigger className="text-gray-700 hover:text-blue-600 focus:outline-none">
//               Services
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem>Web Development</DropdownMenuItem>
//               <DropdownMenuItem>Mobile Development</DropdownMenuItem>
//               <DropdownMenuItem>SEO</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <a href="#" className="text-gray-700 hover:text-blue-600">
//             Contact
//           </a>
//         </div>
//       </div>

//       {/* Overlay for Mobile Nav */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={toggleNav}
//         ></div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Exam = () => {
  const [examQuestions, setExamQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { selectedTopics, selectedVehicle } = location.state || {};

  const fetchAndShuffleQuestions = React.useCallback(async () => {
    try {
      const topicsQuery = selectedTopics.join(","); // Convert array to comma-separated string
      const vehicleQuery = selectedVehicle; // Assuming `selectedVehicle` is already a string or ID

      // Fetch questions from the backend
      const apiUrl =
        "https://traffic-solve-cors-backend.vercel.app/api/questions";
      const response = await axios.get(apiUrl);

      if (response?.data) {
        // Filter questions by both vehicle and topics
        const filteredQuestions = response.data.filter((question) =>
          question.vehicles.some((vehicle) => vehicle._id === vehicleQuery) &&
          topicsQuery.split(",").includes(question.topic._id)
        );

        // Shuffle the filtered questions
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };

        const shuffledQuestions = shuffleArray(filteredQuestions);

        // Determine the number of questions based on vehicle category
        const checkQuestionCategory = selectedVehicle.split(" ")[0];
        const includesCorD =
          checkQuestionCategory.toLowerCase().includes("c") ||
          checkQuestionCategory.toLowerCase().includes("d");
        const questionLimit = includesCorD ? 40 : 30;

        // Select the first `questionLimit` questions
        const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

        setExamQuestions(selectedQuestions);
        setUserAnswers(Array(selectedQuestions.length).fill(null));
      } else {
        setError("No questions found in the database.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("Failed to fetch questions.");
    } finally {
      setLoading(false);
    }
  }, [selectedTopics, selectedVehicle]);

  useEffect(() => {
    fetchAndShuffleQuestions();
  }, [fetchAndShuffleQuestions]);

  console.log("examQuestions", examQuestions);

  return (
    <div>
      <h1>Exam</h1>
      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* Render questions here */}
    </div>
  );
};

export default Exam;

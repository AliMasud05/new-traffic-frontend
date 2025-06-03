import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Edit,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import CreateQuestion from "./CreateQuestion";
import AdminTopics from "./AdminVehicle&Topics";
import PropTypes from "prop-types";

const AdminQuestions = ({ questionTabActive }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({
    title: "",
    options: [],
    correctAnswer: "",
    topic: "",
    vehicles: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);

  const questionsPerPage = 10;

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchQuestions();
      fetchTopics();
    }
  }, [token, navigate]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/questions"
      );
      const reversedQuestions = response?.data.reverse();
      setQuestions(reversedQuestions);
      setFilteredQuestions(reversedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/topics"
      );
      setTopics(response?.data);
    } catch (error) {
      console.error("Failed to fetch topics", error);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  const handleDeleteQuestion = async (id) => {
    setIsDeleting(id);
    try {
      await axios.delete(
        `https://traffic-solve-cors-backend.vercel.app/api/questions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Question deleted successfully!");
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("Failed to delete question.");
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditModal = (question) => {
    setCurrentQuestion(question);
    setEditedQuestion({
      title: question.title,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      topic: question.topic?._id,
      vehicles: question.vehicles.map((v) => v._id),
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentQuestion(null);
    setEditedQuestion({
      title: "",
      options: [],
      correctAnswer: "",
      topic: "",
      vehicles: [],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleVehicleChange = (vehicleId) => {
    setEditedQuestion((prev) => {
      const vehicles = [...prev.vehicles];
      const index = vehicles.indexOf(vehicleId);
      if (index === -1) {
        vehicles.push(vehicleId);
      } else {
        vehicles.splice(index, 1);
      }
      return { ...prev, vehicles };
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "traffic-exam");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/deyqhzw8p/image/upload",
          imageData
        );
        imageUrl = cloudinaryResponse.data.secure_url;
      }
      await axios.put(
        `https://traffic-solve-cors-backend.vercel.app/api/questions/${currentQuestion._id}`,
        { ...editedQuestion, photo: imageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Question updated successfully!");
      fetchQuestions();
      closeEditModal();
    } catch (error) {
      console.error("Failed to update question", error);
      toast.error("Failed to update question.");
    }
  };

  const filterQuestionsByTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
    if (topic === "all") {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(
        (question) =>
          question.topic?.name?.toLowerCase() === topic.toLowerCase()
      );
      setFilteredQuestions(filtered);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    const normalizedTerm = term
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    setSearchTerm(term);
    setCurrentPage(1);

    if (normalizedTerm === "") {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter((question) => {
        const normalizedQuestionTitle = question.title
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        const normalizedTopicName = question.topic?.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        const normalizedVehicleNames = question.vehicles
          .map((vehicle) =>
            vehicle.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
          )
          .join(", ");
        const normalizedOptions = question.options
          .map((option) =>
            option
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
          )
          .join(", ");

        return (
          normalizedQuestionTitle.includes(normalizedTerm) ||
          normalizedTopicName.includes(normalizedTerm) ||
          normalizedVehicleNames.includes(normalizedTerm) ||
          normalizedOptions.includes(normalizedTerm)
        );
      });

      setFilteredQuestions(filtered);
    }
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredQuestions.length / questionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {questionTabActive === "all" && (
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Question Management
              </h1>
              <p className="text-gray-600">
                Manage and organize all exam questions
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredQuestions.length} questions
              </span>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Topic
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTopic}
                    onChange={(e) => filterQuestionsByTopic(e.target.value)}
                  >
                    <option value="all">All Topics</option>
                    {topics?.map((topic, index) => (
                      <option key={index} value={topic.name}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Questions
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search questions, topics, or vehicle types..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {currentQuestions.length > 0 ? (
              currentQuestions.map((question) => (
                <div
                  key={question._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      {/* Question Content */}
                      <div className="flex-1">
                        {question.photo && (
                          <div className="mb-4">
                            <img
                              src={question.photo}
                              alt="Question"
                              className="max-w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        {/* <img src="https://res.cloudinary.com/deyqhzw8p/image/upload/v1743983688/bjjv3exr3fzezagr90qn.png" 
                        alt="Question" className="max-w-full max-h-48  rounded-lg" /> */}

                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                          {question.title}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Vehicle:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {question.vehicles.map((vehicle) => (
                                <span
                                  key={vehicle._id}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                                >
                                  {vehicle.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Topic:
                            </span>
                            <p className="mt-1 text-gray-800">
                              {question.topic?.name}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-500">
                            Options:
                          </span>
                          <ul className="mt-2 space-y-2">
                            {question.options?.map((option, index) => (
                              <li key={index} className="flex items-start">
                                <span
                                  className={`inline-flex items-center justify-center h-5 w-5 rounded-full mr-2 mt-0.5 flex-shrink-0 ${
                                    index === question.correctOption
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <span
                                  className={`${
                                    index === question.correctOption
                                      ? "font-medium text-green-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Correct Answer:
                          </span>
                          <p className="mt-1 font-medium text-green-600">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex md:flex-col gap-2">
                        <button
                          onClick={() => openEditModal(question)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          disabled={isDeleting === question._id}
                        >
                          {isDeleting === question._id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No questions found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No questions match your search criteria"
                      : "No questions available for the selected topic"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredQuestions.length > questionsPerPage && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <div className="text-sm text-gray-600">
                Page {currentPage} of{" "}
                {Math.ceil(filteredQuestions.length / questionsPerPage)}
              </div>

              <button
                onClick={nextPage}
                disabled={
                  currentPage ===
                  Math.ceil(filteredQuestions.length / questionsPerPage)
                }
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                  currentPage ===
                  Math.ceil(filteredQuestions.length / questionsPerPage)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Question</h2>
              <button
                onClick={closeEditModal}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-6">
                {/* Question Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editedQuestion.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-3">
                    {editedQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-8 text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    name="correctAnswer"
                    value={editedQuestion.correctAnswer}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select correct answer</option>
                    {editedQuestion.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <select
                    name="topic"
                    value={editedQuestion.topic}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Vehicles
                  </label>
                  {editedQuestion.topic ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {topics
                        .find((t) => t._id === editedQuestion.topic)
                        ?.vehicles?.map((vehicle) => (
                          <div key={vehicle._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`vehicle-${vehicle._id}`}
                              checked={editedQuestion.vehicles.includes(
                                vehicle._id
                              )}
                              onChange={() => handleVehicleChange(vehicle._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`vehicle-${vehicle._id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {vehicle.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Please select a topic first
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-vehicle-image">Vehicle Image</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-h-32 object-contain"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <X className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          </div>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="edit-vehicle-image"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="edit-vehicle-image"
                                name="edit-vehicle-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {questionTabActive === "create" && (
        <div className="max-w-7xl mx-auto p-6">
          <CreateQuestion
            onQuestionCreated={fetchQuestions}
            onTopicCreated={fetchTopics}
          />
        </div>
      )}

      {questionTabActive === "topics" && (
        <div className="max-w-7xl mx-auto p-6">
          <AdminTopics onTopicCreated={fetchTopics} />
        </div>
      )}
    </div>
  );
};

AdminQuestions.propTypes = {
  questionTabActive: PropTypes.string.isRequired,
};

export default AdminQuestions;
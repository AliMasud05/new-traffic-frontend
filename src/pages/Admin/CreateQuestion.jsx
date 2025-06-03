import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Loader2, PlusCircle, Trash2, Upload, X } from "lucide-react";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [token] = useState(localStorage.getItem("token"));

  const [questionTitle, setQuestionTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
        );
        setVehicles(response.data);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
        toast.error("Failed to load vehicle types");
      }
    };
    fetchVehicles();
  }, []);

  const fetchTopicsForVehicles = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const topicsPromises = selectedVehicles.map((vehicleId) =>
        axios.get(
          `https://traffic-solve-cors-backend.vercel.app/api/topics/vehicle/${vehicleId}`
        )
      );

      const responses = await Promise.all(topicsPromises);
      const combinedTopics = responses.flatMap((response) => response.data);

      const uniqueTopics = combinedTopics.filter(
        (topic, index, self) =>
          index === self.findIndex((t) => t._id === topic._id)
      );

      setTopics(uniqueTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to load topics");
    } finally {
      setLoadingTopics(false);
    }
  }, [selectedVehicles]);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  useEffect(() => {
    if (selectedVehicles.length > 0) {
      fetchTopicsForVehicles();
    } else {
      setTopics([]);
      setSelectedTopic("");
    }
  }, [selectedVehicles, fetchTopicsForVehicles]);

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

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);

      if (correctOption === options[index]) {
        setCorrectOption("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedVehicles.length === 0) {
      toast.error("Please select at least one vehicle type.");
      return;
    }
    if (!selectedTopic) {
      toast.error("Please select a topic.");
      return;
    }
    if (options.some((opt) => opt.trim() === "")) {
      toast.error("All options must be filled.");
      return;
    }
    if (!correctOption) {
      toast.error("Please select the correct option.");
      return;
    }

    setLoading(true);

    try {
      const questionData = {
        title: questionTitle,
        topicId: selectedTopic,
        vehicleIds: selectedVehicles,
        options: options,
        correctAnswer: correctOption,
      };

      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "traffic-exam");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/deyqhzw8p/image/upload",
          imageData
        );
        questionData.photo = cloudinaryResponse.data.secure_url;
      }

      await axios.post(
        "https://traffic-solve-cors-backend.vercel.app/api/questions",
        questionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Question added successfully!");

      // Reset form
      setQuestionTitle("");
      setOptions(["", ""]);
      setCorrectOption("");
      setImage(null);
      setImagePreview(null);
      setSelectedVehicles([]);
      setSelectedTopic("");
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error(error.response?.data?.message || "Failed to add question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            Create New Question
          </h2>
          <p className="text-blue-100 mt-1">
            Fill in the details to add a new question to the database
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Types
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select one or more vehicle types this question applies to
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={`vehicle-${vehicle._id}`}
                        checked={selectedVehicles.includes(vehicle._id)}
                        onChange={() => handleVehicleChange(vehicle._id)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`vehicle-${vehicle._id}`}
                        className="font-medium text-gray-700"
                      >
                        {vehicle.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={loadingTopics || selectedVehicles.length === 0}
                  required
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {loadingTopics && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              {selectedVehicles.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Please select vehicle type(s) first
                </p>
              )}
            </div>
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1">
              <textarea
                rows={3}
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Enter your question here"
                required
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer Options
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Provide between 2-4 answer options (minimum 2 required)
            </p>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                  {index >= 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusCircle className="-ml-0.5 mr-1.5 h-4 w-4 text-blue-600" />
                  Add Option
                </button>
              )}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select the correct answer</option>
              {options.map((option, index) => (
                <option 
                  key={index} 
                  value={option}
                  disabled={option.trim() === ""}
                >
                  {option || `Option ${index + 1} (empty)`}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-48 object-contain" 
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
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
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

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Creating Question...
                </>
              ) : (
                "Create Question"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;
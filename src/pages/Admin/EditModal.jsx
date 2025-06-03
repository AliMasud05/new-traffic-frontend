import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

export function UpdateQuestionModal({ questionId }) {
  console.log(questionId, "questionId in update modal");
  const [loading, setLoading] = useState(false);
  const [questionTitle, setQuestionTitle] = useState(question.title);
  const [options, setOptions] = useState([...question.options]);
  const [correctOption, setCorrectOption] = useState(question.correctAnswer);
  const [selectedVehicles, setSelectedVehicles] = useState(
    question.vehicles?.map(v => v._id) || []
  );
  const [selectedTopic, setSelectedTopic] = useState(question.topic?._id || "");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(question.photo || null);
  const [availableTopics, setAvailableTopics] = useState([]);

  const token = localStorage.getItem("token");
console.log(question, "question in update modal");

  // Fetch topics based on selected vehicles
  const fetchTopicsForVehicles = useCallback(async () => {
    if (selectedVehicles.length === 0) {
      setAvailableTopics([]);
      return;
    }

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

      setAvailableTopics(uniqueTopics);

      // Reset topic if current selection is no longer valid
      if (selectedTopic && !uniqueTopics.some((t) => t._id === selectedTopic)) {
        setSelectedTopic("");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to load topics");
    }
  }, [selectedVehicles, selectedTopic]);

  // Initialize form with question data
  useEffect(() => {
    if (question) {
      setQuestionTitle(question.title);
      setOptions([...question.options]);
      setCorrectOption(question.correctAnswer);
      setSelectedTopic(question.topic?._id || "");
      setSelectedVehicles(question.vehicles?.map((v) => v._id) || []);
      setImagePreview(question.photo || null);
    }
  }, [question]);

  // Update available topics when selected vehicles change
  useEffect(() => {
    fetchTopicsForVehicles();
  }, [fetchTopicsForVehicles]);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      // Prepare question data
      const questionData = {
        title: questionTitle,
        topicId: selectedTopic,
        vehicleIds: selectedVehicles,
        options: options,
        correctAnswer: correctOption,
      };

      // Handle image upload
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "traffic-exam");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/deyqhzw8p/image/upload",
          imageData
        );
        questionData.photo = cloudinaryResponse.data.secure_url;
      } else if (question.photo && !imagePreview) {
        // If existing photo was removed
        questionData.photo = null;
      } else if (question.photo) {
        // Keep existing photo if no new image is uploaded
        questionData.photo = question.photo;
      }

      // Update question
      await axios.put(
        `https://traffic-solve-cors-backend.vercel.app/api/questions/${question._id}`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Question updated successfully!");
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(
        error.response?.data?.message || "Failed to update question."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-black p-2 bg-indigo-300 w-24">
          Edit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white max-h-[90vh] overflow-y-auto max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Edit Question
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Types (Select one or more)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicles?.map((vehicle) => (
                    <div key={vehicle._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-vehicle-${vehicle._id}`}
                        checked={selectedVehicles.includes(vehicle._id)}
                        onChange={() => handleVehicleChange(vehicle._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`edit-vehicle-${vehicle._id}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {vehicle.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={availableTopics.length === 0}
                  required
                >
                  <option value="">Select Topic</option>
                  {availableTopics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {selectedVehicles.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Please select vehicle type(s) first
                  </p>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options (2-4 options)
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {index >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-600 hover:text-red-800 transition"
                        title="Remove option"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2 text-sm"
                  >
                    <PlusCircle size={16} /> Add another option
                  </button>
                )}
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Image (Optional)
                </label>
                {question.photo && !image && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                    <img 
                      src={question.photo} 
                      alt="Current question" 
                      className="max-w-xs max-h-40 object-contain border border-gray-200 rounded" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} /> Remove Image
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {imagePreview && image && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">New Image Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-xs max-h-40 object-contain border border-gray-200 rounded" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} /> Remove Image
                    </button>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <AlertDialogCancel className="w-full sm:w-auto">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    "Update Question"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

UpdateQuestionModal.propTypes = {
  questionId: PropTypes.string.isRequired,
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string.isRequired,
    topic: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    }),
    vehicles: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      })
    ),
    photo: PropTypes.string
  }).isRequired,
  fetchQuestions: PropTypes.func.isRequired,
  vehicles: PropTypes.array.isRequired
};
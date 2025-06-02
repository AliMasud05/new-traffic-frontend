import { fetchTopicsByVehicle, fetchVehicles, updateQuestion } from "@/services/api";
import React, { useState, useEffect } from "react";


const UpdateQuestionForm = ({ questionId, initialData }) => {
  const [vehicles, setVehicles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    question: initialData.question,
    image: initialData.image,
    correct_answer: initialData.correct_answer,
    answer_1: initialData.answer_1,
    answer_2: initialData.answer_2,
    answer_3: initialData.answer_3,
    answer_4: initialData.answer_4,
    topicsId: initialData.topicsId,
    vehicleIds: initialData.vehicleIds,
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      const vehicles = await fetchVehicles();
      setVehicles(vehicles);
    };
    loadVehicles();
  }, []);

  // Fetch topics when vehicle is selected
  const handleVehicleChange = async (vehicleId) => {
    const topics = await fetchTopicsByVehicle(vehicleId);
    setTopics(topics);
    setFormData({ ...formData, vehicleIds: [vehicleId] });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateQuestion(questionId, formData);
      alert("Question updated successfully!");
    } catch (error) {
      alert("Failed to update question.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vehicle Select */}
      <label htmlFor="vehicle">Vehicle:</label>
      <select
        id="vehicle"
        name="vehicle"
        onChange={(e) => handleVehicleChange(e.target.value)}
        value={formData.vehicleIds[0] || ""}
      >
        <option value="">Select a Vehicle</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle._id} value={vehicle._id}>
            {vehicle.vehicle}
          </option>
        ))}
      </select>

      {/* Topic Select */}
      <label htmlFor="topicsId">Topic:</label>
      <select
        id="topicsId"
        name="topicsId"
        value={formData.topicsId}
        onChange={handleInputChange}
      >
        <option value="">Select a Topic</option>
        {topics.map((topic) => (
          <option key={topic._id} value={topic._id}>
            {topic.topic}
          </option>
        ))}
      </select>

      {/* Other Fields */}
      <label htmlFor="question">Question:</label>
      <input
        type="text"
        id="question"
        name="question"
        value={formData.question}
        onChange={handleInputChange}
        required
      />

      <label htmlFor="image">Image URL:</label>
      <input
        type="text"
        id="image"
        name="image"
        value={formData.image}
        onChange={handleInputChange}
      />

      <label htmlFor="correct_answer">Correct Answer:</label>
      <input
        type="text"
        id="correct_answer"
        name="correct_answer"
        value={formData.correct_answer}
        onChange={handleInputChange}
        required
      />

      <label htmlFor="answer_1">Answer 1:</label>
      <input
        type="text"
        id="answer_1"
        name="answer_1"
        value={formData.answer_1}
        onChange={handleInputChange}
        required
      />

      <label htmlFor="answer_2">Answer 2:</label>
      <input
        type="text"
        id="answer_2"
        name="answer_2"
        value={formData.answer_2}
        onChange={handleInputChange}
        required
      />

      <label htmlFor="answer_3">Answer 3:</label>
      <input
        type="text"
        id="answer_3"
        name="answer_3"
        value={formData.answer_3}
        onChange={handleInputChange}
        required
      />

      <label htmlFor="answer_4">Answer 4:</label>
      <input
        type="text"
        id="answer_4"
        name="answer_4"
        value={formData.answer_4}
        onChange={handleInputChange}
      />

      {/* Submit Button */}
      <button type="submit">Update Question</button>
    </form>
  );
};

export default UpdateQuestionForm;
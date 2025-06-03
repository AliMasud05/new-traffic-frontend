import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Fetch available vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const response = await axios.get(
          "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
        );
        setVehicles(response.data);

        // Automatically select the first vehicle if available
        if (response.data.length > 0) {
          setSelectedVehicle(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch topics for the selected vehicle and auto-select all
  useEffect(() => {
    if (!selectedVehicle) return;

    const fetchTopicsForVehicle = async () => {
      setLoadingTopics(true);
      try {
        const response = await axios.get(
          `https://traffic-solve-cors-backend.vercel.app/api/topics/vehicle/${selectedVehicle}`
        );
        setTopics(response.data);
        console.log(response.data, "topics for vehicle");

        // Automatically select all topics for the selected vehicle
        const allTopicIds = response.data.map((topic) => topic._id);
        setSelectedTopics(new Set(allTopicIds));
        setAllSelected(true);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopicsForVehicle();
  }, [selectedVehicle]);

  // Handle quiz start
  const handleStartQuiz = () => {
    if (selectedTopics.size === 0) {
      alert("Please select at least one topic before starting the exam.");
      return;
    }
    navigate("/exam", {
      state: {
        selectedTopics: Array.from(selectedTopics),
        selectedVehicle,
        fromHome: true,
      },
    });
  };

  // Handle topic selection toggle
  const toggleTopic = (topicId) => {
    const newSelection = new Set(selectedTopics);
    if (newSelection.has(topicId)) {
      newSelection.delete(topicId);
    } else {
      newSelection.add(topicId);
    }
    setSelectedTopics(newSelection);
    setAllSelected(newSelection.size === topics.length);
  };

  // Mark all/unmark all topics
  const toggleAllTopics = () => {
    if (allSelected) {
      setSelectedTopics(new Set());
      setAllSelected(false);
    } else {
      const allTopicIds = topics.map((topic) => topic._id);
      setSelectedTopics(new Set(allTopicIds));
      setAllSelected(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {loadingVehicles ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-[#BE3144]">Loading vehicles...</p>
        </div>
      ) : (
        <div>
          <div className="flex flex-col justify-between items-center gap-2 mb-4">
            <Button
              className="bg-[#BE3144] text-black px-12 text-sm md:text-base py-5 hover:bg-[#F72C5B]"
              onClick={handleStartQuiz}
            >
              <span className="text-sm lg:text-base font-semibold">გამოცდის დაწყება</span>
            </Button>

            <Select 
              onValueChange={(value) => setSelectedVehicle(value)} 
              value={selectedVehicle}
            >
              <SelectTrigger className="w-full bg-[#BE3144] text-sm md:text-base text-black px-4 py-6 rounded-md flex items-center">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent className="w-full py-4 bg-[#BE3144] text-sm md:text-base text-white shadow-lg rounded-md">
                {vehicles?.map((vehicle) => (
                  <SelectItem
                    key={vehicle._id}
                    className="px-4 py-2 w-full text-sm md:text-base hover:bg-green-400 cursor-pointer font-semibold"
                    value={vehicle._id}
                  >
                    <div className="flex place-items-center gap-2">
                      <img src={vehicle.photo} alt="vehicle" className="w-16 h-6 object-cover" />
                      <span className="block font-bold text-sm md:text-base">{vehicle.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingTopics ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-[#BE3144]">Loading topics...</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-4">
              {topics.length === 0 ? (
                <div className="text-center text-gray-500">No topics available for this vehicle.</div>
              ) : (
                <>
                  <div className="flex justify-center mb-4 items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAllTopics}
                      className={`peer ${allSelected ? "bg-[#BE3144] text-white" : "bg-gray-200"}`}
                    />
                    <span className="ml-2 text-[14px] font-bold leading-[21px] font-sans">მონიშნე/წაშალე ყველა</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[rgb(33,37,41)]">
                    {topics.map((topic, index) => (
                      <div key={topic._id} className="flex items-center gap-2 mx-0 md:mx-14 text-sm md:text-sm lg:text-base font-semibold leading-[21px]">
                        <Checkbox
                          className={`peer ${selectedTopics.has(topic._id) ? "bg-[#BE3144] text-white" : "bg-gray-200"}`}
                          checked={selectedTopics.has(topic._id)}
                          onCheckedChange={() => toggleTopic(topic._id)}
                        />
                        <p className="font-sans">{index + 1}</p>
                        <p>{topic.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
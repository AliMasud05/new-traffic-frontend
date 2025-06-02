import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import rightArrow from "../assets/exam/image.png";
import leftArrow from "../assets/exam/Vector (2).png";
import question from "../assets/exam/question (1).png";
import question1 from "../assets/exam/question.png";
import Prohibition from "../assets/exam/Prohibition.png";
import backicon from "../assets/exam/backicon.png";

const Exam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [autoMoveNext, setAutoMoveNext] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [vehicleCategory, setVehicleCategory] = useState("");

  // Extract selected topics and vehicle from location state
  const { selectedTopics, selectedVehicle } = location.state || {};

  // Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  console.log(examQuestions, "examQuestions");
  console.log(selectedTopics, "selectedTopics");

  // Fetch and shuffle questions
  const fetchAndShuffleQuestions = useCallback(async () => {
    setLoading(true);

    try {
      const topicsQuery = selectedTopics.join(",");
      const vehicleQuery = selectedVehicle;

      // Fetch questions from the backend
      const apiUrl = "http://localhost:5000/api/questions";
      const response = await axios.get(apiUrl);

      if (response?.data) {
        // Filter questions by both vehicle and topics
        const filteredQuestions = response.data.filter(
          (question) =>
            question.vehicles.some((vehicle) => vehicle._id === vehicleQuery) &&
            topicsQuery.split(",").includes(question.topic._id)
        );

        // Shuffle the filtered questions
        const shuffledQuestions = shuffleArray(filteredQuestions);

        // Determine the number of questions based on vehicle category
        const vehicleUrl = `http://localhost:5000/api/vehicles/${selectedVehicle}`;
        const responseVehicle = await axios.get(vehicleUrl);
        const vehicleName = responseVehicle?.data?.name;

        const checkQuestionCategory = vehicleName.split(" ")[0];
        setVehicleCategory(checkQuestionCategory.toLowerCase());
        const includesCorD =
          checkQuestionCategory.toLowerCase().includes("c") ||
          checkQuestionCategory.toLowerCase().includes("d");
        const questionLimit = includesCorD ? 40 : 30;

        // Select the first `questionLimit` questions
        const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

        setExamQuestions(selectedQuestions);
        setUserAnswers(Array(selectedQuestions.length).fill(null));
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setTimeLeft(includesCorD ? 2400 : 1800); // Reset timer
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

  // Fetch questions when the component mounts
  useEffect(() => {
    if (!selectedTopics || !selectedVehicle) {
      navigate("/", { replace: true });
    } else {
      fetchAndShuffleQuestions();
    }
  }, [fetchAndShuffleQuestions, selectedTopics, selectedVehicle, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setShowFailModal(true);
    }
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswerClick = (option) => {
    if (userAnswers[currentQuestionIndex] !== null) return;

    const correctAnswer = examQuestions[currentQuestionIndex].correctAnswer;
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = option;
    setUserAnswers(updatedAnswers);

    if (option === correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);

      // Check if user has exceeded allowed wrong answers
      const includesCorD =
        vehicleCategory.includes("c") || vehicleCategory.includes("d");
      const maxWrongAnswers = includesCorD ? 5 : 4; // C/D: 5 wrongs fail (4 chances), Others: 4 wrongs fail (3 chances)

      if (wrongAnswers + 1 >= maxWrongAnswers) {
        setShowFailModal(true);
      }
    }

    if (autoMoveNext && currentQuestionIndex < examQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 500);
    }
  };

  // Handle result submission
  const handleResultClick = () => {
    const allAnswered = userAnswers.every((answer) => answer !== null);
    if (!allAnswered) return;

    const totalQuestions = examQuestions.length;
    const passingPercentage = (correctAnswers / totalQuestions) * 100;
    const passStatus = passingPercentage >= 86.67;

    navigate("/result", {
      state: {
        correctAnswers,
        wrongAnswers,
        totalQuestions,
        selectedTopics,
        selectedVehicle,
        passStatus,
      },
    });
  };

  // Restart the exam
  const restartExam = () => {
    if (!selectedTopics || !selectedVehicle) {
      alert("Unable to restart exam. Missing required data.");
      return;
    }

    fetchAndShuffleQuestions();
    setShowFailModal(false);
  };

  return (
    <div
      className="relative min-h-screen w-full text-white bg-cover bg-center flex flex-col "
      style={{
        backgroundImage:
          "url('https://wallpapers.com/images/hd/logo-background-zgqtb9n3ieqmc3fx.jpg')",
      }}
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full relative">
        <div className="min-h-screen ">
          {/* Top border */}

          {/* Main content area */}
          <div className="flex-1 flex ">
            <div className="w-full ">
              {/* Main image and question area */}
              <div className="relative bg-white  overflow-hidden shadow-2xl border-2 border-[#e2d5d5] ">
                <div className="relative h-[500px] flex-1">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/040/519/146/non_2x/vehicle-traffic-at-traffic-signal-vector.jpg"
                    alt="Traffic intersection scene"
                    className="w-full h-[100%]"
                  />

                  {/* Text overlay on image */}
                  <div className="absolute -bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">

                    {/* question title */}
                    <p className="text-sm leading-relaxed mb-3">
                      საგზაო საგზაო დამრეგულირებელი აგზნიშნავს ჩართული ანტენა
                      ლურჯი მოუვლელი სხვადასხვა ტრანსპორტის და სხვები სექციები.
                      რომელი აგზნიშნავს მძღოლებს ზუსტად გაიარონ მოძრაობის ისრის
                      მიმართულებით მარეგულირებელის ამ სიგნალზე?
                    </p>
                  </div>
                </div>

                {/*questions Multiple choice options */}
                <div className="bg-gray-800 text-white">
                  <div className="grid grid-cols-2">
                    {/* Option 1 */}
                    <div className="border-r border-b border-[#FFFFFF] p-4 hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 text-xl">
                          1
                        </div>
                        <p className="text-sm leading-relaxed">
                          საგზაო საგზაო დამრეგულირებელი, სატვირთო და სხვები
                          მუშები აგზნიშნავს მოუვლელი
                        </p>
                      </div>
                    </div>

                    {/* Option 2 */}
                    <div className="border-b border-[#FFFFFF] p-4 hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 text-xl">
                          2
                        </div>
                        <p className="text-sm leading-relaxed">
                          საგზაო საგზაო დამრეგულირებელი, სატვირთო და ლურჯი
                          მუშები აგზნიშნავს მოუვლელი
                        </p>
                      </div>
                    </div>

                    {/* Option 3 */}
                    <div className="border-r border-[#FFFFFF] p-4 hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 text-xl">
                          3
                        </div>
                        <p className="text-sm leading-relaxed">
                          სატვირთო და სხვები მუშები აგზნიშნავს მოუვლელი
                        </p>
                      </div>
                    </div>

                    {/* Option 4 */}
                    <div className="p-4 hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 text-xl">
                          4
                        </div>
                        <p className="text-sm leading-relaxed">
                          ლურჯი მოუვლელი სხვადასხვა ტრანსპორტის და სხვები
                          სექციები აგზნიშნავს
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2  mt-2 ">
            <div className="flex items-center gap-4 ">
              <div className="flex flex-col items-center gap-2">
                <button className="bg-[#F0F2BD] text-[#008318] text-3xl font-bold py-2 px-8 rounded ">
                  {correctAnswers}
                </button>
                <p className="text-xs">სწორია</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="bg-[#F0F2BD] text-[#F74354] text-3xl font-bold py-2 px-8 rounded">
                  {wrongAnswers}
                </button>
                <p className="text-xs">მცდარია</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="bg-[#F0F2BD] text-[#525352] text-3xl font-bold py-2 px-8 rounded">
                  {currentQuestionIndex + 1}/
                  <span className="text-sm">{examQuestions.length}</span>
                </button>
                <p className="text-xs">კითხვები</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="bg-[#F0F2BD] text-[#525352] text-3xl font-bold py-2 px-8 rounded">
                  <span>00:</span> {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </button>
                <p className="text-xs">დარჩენილი დრო</p>
              </div>
            </div>
            <div className="flex justify-end gap-6 ">
              <div className="flex flex-col items-center">
                <div className="flex  items-center gap-2 bg-[#535353] px-5 mr-2 rounded-lg cursor-pointer hover:bg-[#F0F2BD] transition-colors h-16">
                  <img src={backicon} alt="back" className="w-8 " />
                  <p className="flex flex-col text-sm">
                    {" "}
                    <span>მოლოდინის</span>
                    <span>მდგომარეობა</span>
                  </p>
                </div>
                <div className=" bottom-16 left-0 right-0 w-full  p-2 flex justify-end z-10">
                  <label className="flex items-center space-x-2 mr-4">
                    <input
                      type="checkbox"
                      checked={autoMoveNext}
                      onChange={(e) => setAutoMoveNext(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-white text-xs">
                      ავტომატურად გადასვლა
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex  !items-center bg-[#F9E57C] text-black font-bold h-[60px] px-4  rounded-lg cursor-pointer hover:bg-[#F0F2BD] transition-colors ">
                  <p className="text-sm text-center">შესვლები ბლოკი</p>
                  <img src={rightArrow} alt="back" className="w-8 h-6" />
                </div>
                {/* Auto Move Next Checkbox - Now positioned above navigation */}

                <div>
                  <div className=" bottom-16 left-0 right-0 w-full  p-2 flex justify-end z-10">
                    <label className="flex items-center space-x-2 mr-4">
                      <input
                        type="checkbox"
                        checked={autoMoveNext}
                        onChange={(e) => setAutoMoveNext(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-white text-xs">
                        ავტომატურად გადასვლა
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar with 40 segments */}
          <div className="flex h-6 mt-4">
            {Array.from({ length: 40 }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 border-2 ${
                  index <
                  Math.ceil(
                    ((currentQuestionIndex + 1) / examQuestions.length) * 40
                  )
                    ? "bg-[#F0F2BD] border-[#1a0909]"
                    : "bg-gray-200 border-[#e2d5d5]"
                }`}
              />
            ))}
          </div>

          <div className=" h-20 my-5 grid grid-cols-4">
            <div className="col-span-2  bg-[#303030] px-2 rounded-md flex justify-center items-center gap-2 h-16">
              <img src={question1} alt="question" className="w-14 h-14" />
              <p className="text-[13px]">
                კულტურითი მინიშნება: არჩევა პანელის შიგთავსის შესვლა და დახურვა
                Enter-ს, ბეჭდვის ბლოკების მორგება — დაჭერა Space.
              </p>
            </div>
            <div className="col-span-2  flex justify-end items-center gap-2">
              <div className="w-36 h-16 flex items-center justify-center  gap-2 bg-[#DEDEDE] px-2 rounded-md">
                <img
                  src={Prohibition}
                  alt="prohibition"
                  className="w-12 h-12"
                />
                <p className="text-sm text-[#F74354] font-bold">
                  ტესტის შეწყვეტა
                </p>
              </div>
            </div>
          </div>

          {/* Bottom control panel */}
        </div>
      </div>

      {/* Fail Modal */}
      {showFailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg text-center mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ვერ ჩააბარე!
            </h2>
            <div>
              {timeLeft === 0 ? (
                <img
                  src="https://res.cloudinary.com/deyqhzw8p/image/upload/v1741181253/sklpdwdpmzz3z3n3bdi1.gif"
                  alt="Time's Up"
                  className="w-full h-56 mx-auto"
                />
              ) : (
                <img
                  src="https://res.cloudinary.com/deyqhzw8p/image/upload/v1740923531/dfgkm2b92881lb0zqgfe.png"
                  alt="Failed"
                  className="w-28 h-28 mx-auto"
                />
              )}
            </div>
            <p className="text-gray-700 mb-4">
              {timeLeft === 0 ? (
                <>
                  <span className="block">"ჰმმმ! გავიდა დრო,</span>
                  <span className="block">სამწუხაროდ ჩაიჭერი გამოცდაში.</span>
                  <span className="block">თავიდან დაწყება?</span>
                </>
              ) : (
                "არ დანებდე... კიდევ სცადე... ეცადე ის თემები გადაიმერო, რაც გერთულება"
              )}
            </p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={restartExam}
            >
              ახლიდან დაწყება
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;

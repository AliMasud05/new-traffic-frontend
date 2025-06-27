"use client"

import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import rightArrow from "../assets/exam/image.png"
import question1 from "../assets/exam/question.png"
import Prohibition from "../assets/exam/Prohibition.png"
import backicon from "../assets/exam/backicon.png"
import icon_reload from "../assets/exam/icon-reload.png"
import icon_arrow from "../assets/exam/icon-arrow-right.png"

const Exam = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredQuestionIndex, setHoveredQuestionIndex] = useState(null)
  // State variables
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [examQuestions, setExamQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [autoMoveNext, setAutoMoveNext] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [vehicleCategory, setVehicleCategory] = useState("")
  const [slideAnimation, setSlideAnimation] = useState("")
  const [isExamTerminated, setIsExamTerminated] = useState(false)
  const [isExamCompleted, setIsExamCompleted] = useState(false)
  const [examPassStatus, setExamPassStatus] = useState(null) // null, true (pass), false (fail)
  
  // Extract selected topics and vehicle from location state
  const { selectedTopics, selectedVehicle } = location.state || {}

  // Check if exam is finished (either terminated or completed)
  const isExamFinished = isExamTerminated || isExamCompleted

  // Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  // Function to move current question to the end with animation
  const moveQuestionToEnd = () => {
    // Start slide down animation
    setSlideAnimation("slide-down")
    
    setTimeout(() => {
      setExamQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions]
        const [movedQuestion] = newQuestions.splice(currentQuestionIndex, 1)
        newQuestions.push(movedQuestion)
        
        // Also move the corresponding answer to maintain alignment
        setUserAnswers(prevAnswers => {
          const newAnswers = [...prevAnswers]
          const [movedAnswer] = newAnswers.splice(currentQuestionIndex, 1)
          newAnswers.push(movedAnswer)
          return newAnswers
        })
        
        return newQuestions
      })
      
      // Reset animation and set slide up for new question
      setSlideAnimation("slide-up")
      
      // After slide up animation, reset animation state
      setTimeout(() => {
        setSlideAnimation("")
      }, 500)
      
      // Keep the same index if not at the end, otherwise stay at current position
      if (currentQuestionIndex >= examQuestions.length - 1) {
        setCurrentQuestionIndex(0)
      }
      // If not at the last question, the index automatically moves to next question
      // since we removed current question and all subsequent questions shifted up
      
    }, 500) // Match this duration with slide-down animation
  }

  // Fetch and shuffle questions
  const fetchAndShuffleQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const topicsQuery = selectedTopics.join(",")
      const vehicleQuery = selectedVehicle
      // Fetch questions from the backend
      const apiUrl =
        "https://traffic-solve-cors-backend.vercel.app/api/questions";
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
        const vehicleUrl = `https://traffic-solve-cors-backend.vercel.app/api/vehicles/${selectedVehicle}`;
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
      console.error("API Error:", error)
      setError("Failed to fetch questions.")
    } finally {
      setLoading(false)
    }
  }, [selectedTopics, selectedVehicle])

  // Fetch questions when the component mounts
  useEffect(() => {
    if (!selectedTopics || !selectedVehicle) {
      navigate("/", { replace: true })
    } else {
      fetchAndShuffleQuestions()
    }
  }, [fetchAndShuffleQuestions, selectedTopics, selectedVehicle, navigate])

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isExamFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft <= 0 && !isExamFinished) {
      setShowFailModal(true)
    }
  }, [timeLeft, isExamFinished])

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // If it's the last question, check if all questions are answered
      const allAnswered = userAnswers.every((answer) => answer !== null)
      if (allAnswered) {
        handleResultClick() // Complete the exam if all questions are answered
      }
    }
  }

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Handle answer selection
  const handleAnswerClick = (option) => {
    if (userAnswers[currentQuestionIndex] !== null) return
    const currentQuestion = examQuestions[currentQuestionIndex]
    const correctAnswer = currentQuestion.correctAnswer
    const updatedAnswers = [...userAnswers]
    updatedAnswers[currentQuestionIndex] = option
    setUserAnswers(updatedAnswers)
    if (option === correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
    } else {
      setWrongAnswers((prev) => prev + 1)
      // Check if user has exceeded allowed wrong answers
      const includesCorD = vehicleCategory.includes("c") || vehicleCategory.includes("d")
      const maxWrongAnswers = includesCorD ? 5 : 4
      if (wrongAnswers + 1 >= maxWrongAnswers) {
        setShowFailModal(true)
      }
    }
    if (autoMoveNext && currentQuestionIndex < examQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
      }, 500)
    }
  }

  //handle terminate exam button click
  const handleTerminateExam = () => {
    const confirmTerminate = window.confirm("დარწმუნებული ხართ, რომ გსურთ გამოცდის შეწყვეტა?")
    
    if (confirmTerminate) {
      setIsExamTerminated(true)
    }
    // If cancel is clicked, do nothing and remain on the same page
  }

  // Handle result submission - now completes exam instead of navigating
  const handleResultClick = () => {
    const allAnswered = userAnswers.every((answer) => answer !== null)
    if (!allAnswered) return
    
    const totalQuestions = examQuestions.length
    const passingPercentage = (correctAnswers / totalQuestions) * 100
    const passStatus = passingPercentage >= 86.67
    
    // Set exam as completed and store pass status
    setIsExamCompleted(true)
    setExamPassStatus(passStatus)
  }

  // Restart the exam with same questions
  const restartSameExam = () => {
    setIsExamTerminated(false)
    setIsExamCompleted(false)
    setExamPassStatus(null)
    setCurrentQuestionIndex(0)
    setUserAnswers(Array(examQuestions.length).fill(null))
    setCorrectAnswers(0)
    setWrongAnswers(0)
    const includesCorD = vehicleCategory.includes("c") || vehicleCategory.includes("d")
    setTimeLeft(includesCorD ? 2400 : 1800)
  }

  // Restart the exam with new questions
  const restartNewExam = () => {
    setIsExamTerminated(false)
    setIsExamCompleted(false)
    setExamPassStatus(null)
    fetchAndShuffleQuestions()
  }

  // Get completion message based on exam status
  const getCompletionMessage = () => {
    if (isExamTerminated) {
      return "გამოცდა დასრულებულია"
    } else if (isExamCompleted) {
      if (examPassStatus) {
        return ""
      } else {
        return ""
      }
    }
    return ""
  }

  // Get current question
  const currentQuestion = examQuestions[currentQuestionIndex] || {}
  const userAnswer = userAnswers[currentQuestionIndex]
  const correctAnswer = currentQuestion.correctAnswer

  return (
    <div
      className="relative min-h-screen w-full text-white bg-cover bg-center flex flex-col"
      style={{
        backgroundImage: "url('https://wallpapers.com/images/hd/logo-background-zgqtb9n3ieqmc3fx.jpg')",
      }}
    >
      {/* Add custom CSS for animations */}
      <style jsx>{`
        .slide-down {
          animation: slideDown 0.5s ease-in-out;
        }
        
        .slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
        
        @keyframes slideDown {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        @keyframes slideUp {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full relative mt-1">
        <div className="min-h-screen">
          {/* Main content area */}
          <div className="flex-1 flex">
            <div className="w-full ">
              {/* Main image and question area */}
              <div className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${slideAnimation}`}>
                {isExamFinished ? (
                  // Show exam completion message
                  <div className="h-[200px] flex items-center justify-center ">
                    <h1 className="text-5xl font-semibold tracking-tight text-[#FBE26F] text-center">
                      {getCompletionMessage()}
                    </h1>
                  </div>
                ) : (
                  <>

                  
                      {/* Show image if available, otherwise show question title */}
                      {currentQuestion.photo ? (
                        <div className="relative h-[500px] flex-1 -mt-4">
                        <>
                          <img
                            src={currentQuestion.photo}
                            alt="Question"
                            className="w-full h-full  object-fill bg-gray-900"
                          />
                          {/* Text overlay on image when image is present */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white p-4">
                            <p className="text-base font-semibold leading-relaxed mb-3 text-center">{currentQuestion.title}</p>
                          </div>
                        </>
                        </div>

                      ) : (
                        /* Show question title in image area when no image */
                        <div className="w-full h-[200px] bg-gradient-to-br from-gray-800 to-gray-900  border-[1px] border-white p-8
                         flex flex-col items-center justify-center">
                          <div className="text-center border-1 border-white ">
                            <h2 className="  font-semibold text-white leading-relaxed">
                              {currentQuestion.title}
                            </h2>
                          </div>
                        </div>
                      )}
                    
                    {/* Multiple choice options */}
                    <div className="bg-gray-800 text-white">
                      <div className="grid grid-cols-2">
                        {currentQuestion.options?.map((option, index) => {
                          // Determine the background color based on answer state
                          let bgClass = "hover:bg-gray-700"
                          if (userAnswer !== null) {
                            if (option === correctAnswer) {
                              bgClass = "bg-green-600"
                            } else if (option === userAnswer && userAnswer !== correctAnswer) {
                              bgClass = "bg-red-600"
                            }
                          }
                          return (
                            <div
                              key={index}
                              className={`border-r border-b border-[#FFFFFF] p-4 cursor-pointer transition-colors ${bgClass}`}
                              onClick={() => handleAnswerClick(option)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 text-xl">
                                  {index + 1}
                                </div>
                                <p className="text-sm leading-relaxed">{option}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <div className="flex flex-wrap  gap-4 mb-7 items-center justify-center md:justify-start">
              <div className="flex flex-col items-center gap-2 col-span-1">
                <button className="bg-[#F0F2BD] text-[#008318] text-3xl font-bold py-2 px-8 rounded">
                  {correctAnswers}
                </button>
                <p className="text-xs">სწორია</p>
              </div>
              <div className="flex flex-col items-center gap-2 col-span-1">
                <button className="bg-[#F0F2BD] text-[#F74354] text-3xl font-bold py-2 px-8 rounded">
                  {wrongAnswers}
                </button>
                <p className="text-xs">მცდარია</p>
              </div>
              <div className="flex flex-col items-center gap-2 col-span-1">
                <button className="bg-[#F0F2BD] text-[#525352] text-3xl font-bold py-2 px-8 rounded">
                  {currentQuestionIndex + 1}/<span className="text-sm">{examQuestions.length}</span>
                </button>
                <p className="text-xs">კითხვები</p>
              </div>
              <div className="flex flex-col items-center gap-2 col-span-2">
                <button className="flex bg-[#F0F2BD] text-[#525352] text-3xl font-bold py-2 px-8 rounded">
                  <span className="">00:</span> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </button>
                <p className="text-xs">დარჩენილი დრო</p>
              </div>
            </div>
            <div className="flex flex-row  md:justify-end  flex-nowrap items-center -mt-14 md:-mt-10">
              {!isExamFinished ? (
                <>
                  <div className="flex flex-col items-center">
                    <button
                      className="flex items-center gap-2 mt-1 md:mt-0 bg-[#535353] px-5  mr-2 rounded-lg cursor-pointer hover:bg-[#F0F2BD] hover:text-black transition-colors h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={moveQuestionToEnd}
                      disabled={slideAnimation !== ""}
                    >
                      <img src={backicon || "/placeholder.svg"} alt="back" className="w-6 md:w-8" />
                      <p className="flex flex-col text-xs md:text-sm">
                      ბოლოსთვის მოტოვება
                      </p>
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {/* Empty div to maintain alignment with the left side */}
                    <div className="mb-2 h-4"></div>
                    <button
                      className={`flex !items-center font-bold h-[60px] px-4 rounded-lg transition-colors ${
                        userAnswer === null 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : 'bg-[#F9E57C] text-black cursor-pointer hover:bg-[#F0F2BD]'
                      }`}
                      onClick={goToNextQuestion}
                      disabled={
                        userAnswer === null || 
                        (currentQuestionIndex === examQuestions.length - 1 && !userAnswers.every((answer) => answer !== null))
                      }
                    >
                      <p className="text-sm text-center">
                        {currentQuestionIndex === examQuestions.length - 1 ? 
                          "შედეგების ნახვა" : 
                          "შემდეგი კითხვა"}
                      </p>  <img src={rightArrow} alt="next" className="w-8 h-6" />
                    </button>
                    {/* Auto Move Next Checkbox positioned above the navigation button */}
                    <div className="mb-2 ">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMoveNext}
                          onChange={(e) => setAutoMoveNext(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-white text-xs">ავტომატურად გადასვლა</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                // Show single restart button when exam is finished
                <div className="  hidden md:block">
                  <button
                    className="flex items-center gap-2 bg-white  text-white font-bold py-6 px-8 rounded-lg transition-colors w-72"
                    
                  >
                    
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Progress bar with question segments - ALWAYS SHOW THIS */}
          <div className="flex h-6 mt-4 relative">
            {Array.from({ length: examQuestions.length }).map((_, index) => {
              const isAnswered = userAnswers[index] !== null;
              const isCorrect = isAnswered && userAnswers[index] === examQuestions[index]?.correctAnswer;
              const isCurrent = index === currentQuestionIndex;
              
              let bgColor = "bg-gray-200";
              if (isAnswered) {
                bgColor = isCorrect ? "bg-green-500" : "bg-red-500";
              } else if (isCurrent && !isExamFinished) {
                bgColor = "bg-yellow-300";
              }

              return (
                <div
                  key={index}
                  className={`flex-1 border-2 border-[#1a0909] relative ${bgColor} ${isAnswered ? 'hover:bg-opacity-80' : ''}`}
                  onMouseEnter={() => isAnswered && setHoveredQuestionIndex(index)}
                  onMouseLeave={() => setHoveredQuestionIndex(null)}
                >
                  {/* Question preview popup - only shown for answered questions */}
                  {hoveredQuestionIndex === index && isAnswered && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-80 bg-white shadow-2xl overflow-hidden border-8 border-white">
                      {/* Main image section */}
                      <div className="relative h-48">
                        {examQuestions[index]?.photo ? (
                          <img
                            src={examQuestions[index]?.photo}
                            alt="Question preview"
                            className="w-full h-full object-contain bg-gray-900"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                            <h3 className="text-white text-center text-sm font-medium leading-relaxed">
                              {examQuestions[index]?.title}
                            </h3>
                          </div>
                        )}
                        {/* Question number overlay */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-bold">
                          {index + 1}/{examQuestions.length}
                        </div>
                        {/* Status indicator */}
                        <div className="absolute top-2 right-2">
                          {isCorrect ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Question title below image - only show if image exists */}
                      {examQuestions[index]?.photo && (
                        <div className="p-3 border-b border-gray-300 bg-[#374151] text-center ">
                          <p className="text-sm text-white font-medium">{examQuestions[index]?.title}</p>
                        </div>
                      )}
                      
                      {/* Answer options section */}
                      <div className=" bg-gray-50">
                        {isCorrect ? (
                          // Single correct answer display
                          <div className="bg-green-100 p-3 rounded border border-green-300">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-700">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm text-green-800 font-medium">{examQuestions[index]?.correctAnswer}</p>
                            </div>
                          </div>
                        ) : (
                          // Grid display for wrong answer (showing both correct and user's answer)
                          <div className="grid grid-cols-2 gap-1">
                            {/* User's wrong answer */}
                            <div className="bg-[#052029]/90 p-3 rounded border border-red-300">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-6 h-6  flex items-center justify-center ">
                                </div>
                                <p className="text-xs font-semibold text-white ">{userAnswers[index]}</p>
                              </div>
                            </div>

                            {/* Correct answer */}
                            <div className="bg-[#00831D] p-3 rounded border border-green-300">
                              <div className="flex items-center gap-2 ">
                                <div className="w-6 h-6  rounded-full flex items-center justify-center ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <p className="text-xs font-semibold text-white ">{examQuestions[index]?.correctAnswer}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Result summary at bottom */}
                      <div className="bg-gray-100 p-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <>
                                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-700"></div>
                                <span className="text-xs font-semibold text-green-700">Correct Answer</span>
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-700"></div>
                                <span className="text-xs font-semibold text-red-700">Wrong Answer</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Show completion message and restart buttons when exam is finished */}
          {isExamFinished && (
            <div className="mt-4 text-center">
              <div className="rounded-lg shadow-lg p-6 mb-6">
              
                <h2 className="text-2xl leading-10 font-bold text-[#FBE26F] mb-4">
                  {isExamTerminated 
                    ? "გილოცავთ! ახლა რომ ნამდვილ გამოცდას აბარებდეთ, თეორია მოშორებული გექნებოდათ."
                    : examPassStatus 
                      ? "ამ შედეგით მართვის მოწმობას ვერ აიღებდით... სცადეთ კიდევ ერთხელ, ყველაფერი გამოგივათ!"
                      : "ამ შედეგით მართვის მოწმობას ვერ აიღებდით... სცადეთ კიდევ ერთხელ, ყველაფერი გამოგივათ!"
                  }
                </h2>
                
                {/* Test result actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  <button 
                    onClick={restartSameExam}
                    className="bg-white max-w-[210px] text-black flex gap-2 font-medium py-4 px-6 rounded-lg transition-colors duration-200 min-w-[200px]"
                  >
                    <img src={icon_reload} alt="reload" className="w-8 h-8" />
                    <span className="text-xs text-wrap">ახლიდან დაწყება იგივე ბილეთებით</span>
                  </button>
                  <button 
                    onClick={restartNewExam}
                    className="bg-white text-black max-w-[210px] flex gap-2 font-medium py-4 px-6 rounded-lg transition-colors duration-200 min-w-[200px]"
                  >
                   <span className="text-xs text-wrap">ახალი გამოცდა სხვა ბილეთებით</span>
                   <img src={icon_arrow} alt="arrow" className="w-8 h-8" />
                  </button>
                </div>

                <div className="flex justify-center items-center gap-2 mt-10">
                        <div className="max-w-xl bg-[#303030] px-2 rounded-md flex justify-center items-center gap-2 h-16">
                  <img src={question1} alt="question" className="w-14 h-14" />
                  <p className="md:text-[13px] text-[6px]">
                    კულტურითი მინიშნება: არჩევა პანელის შიგთავსის შესვლა და დახურვა Enter-ს, ბეჭდვის ბლოკების მორგება —
                    დაჭერა Space.
                  </p>
                </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="h-20 my-5 grid grid-cols-1 md:grid-cols-4 gap-4 ">
            {!isExamFinished && (
              <>
                <div className="col-span-2 bg-[#303030] px-2 rounded-md flex justify-center items-center gap-2 h-16">
                  <img src={question1} alt="question" className="w-14 h-14" />
                  <p className="text-[13px]">
                    კულტურითი მინიშნება: არჩევა პანელის შიგთავსის შესვლა და დახურვა Enter-ს, ბეჭდვის ბლოკების მორგება —
                    დაჭერა Space.
                  </p>
                </div>
                <div className="hidden md:block col-span-2 mt-5">
                  <div className=" flex justify-end items-center gap-2 -mt-5">
                    <button
                      className="w-36 h-14 p flex items-center justify-center gap-2 bg-[#DEDEDE] px-4 rounded-md"
                      onClick={handleTerminateExam}
                    >
                      <img src={Prohibition || "/placeholder.svg"} alt="prohibition" className="w-12 h-12" />
                      <p className="text-sm text-[#F74354] font-bold">ტესტის შეწყვეტა</p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Fail Modal */}
      {showFailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg text-center mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ვერ ჩააბარე!</h2>
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
                  <span className="block">ჰმმმ! გავიდა დრო,</span>
                  <span className="block">სამწუხაროდ ჩაიჭერი გამოცდაში.</span>
                  <span className="block">თავიდან დაწყება?</span>
                </>
              ) : (
                "არ დანებდე... კიდევ სცადე... ეცადე ის თემები გადაიმერო, რაც გერთულება"
              )}
            </p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => {
                setShowFailModal(false)
                if (!selectedTopics || !selectedVehicle) {
                  alert("Unable to restart exam. Missing required data.")
                  return
                }
                fetchAndShuffleQuestions()
              }}
            >
              ახლიდან დაწყება
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Exam
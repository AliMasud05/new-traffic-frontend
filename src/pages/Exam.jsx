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
  const [timeLeft, setTimeLeft] = useState(0)
  const [maxExamTime, setMaxExamTime] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [autoMoveNext, setAutoMoveNext] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [vehicleCategory, setVehicleCategory] = useState("")
  const [slideAnimation, setSlideAnimation] = useState("")
  const [isExamTerminated, setIsExamTerminated] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Extract selected topics and vehicle from location state
  const { selectedTopics, selectedVehicle } = location.state || {}

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
    setSlideAnimation("slide-down")
    
    setTimeout(() => {
      setExamQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions]
        const [movedQuestion] = newQuestions.splice(currentQuestionIndex, 1)
        newQuestions.push(movedQuestion)
        
        setUserAnswers(prevAnswers => {
          const newAnswers = [...prevAnswers]
          const [movedAnswer] = newAnswers.splice(currentQuestionIndex, 1)
          newAnswers.push(movedAnswer)
          return newAnswers
        })
        
        return newQuestions
      })
      
      setSlideAnimation("slide-up")
      
      setTimeout(() => {
        setSlideAnimation("")
      }, 500)
      
      if (currentQuestionIndex >= examQuestions.length - 1) {
        setCurrentQuestionIndex(0)
      }
    }, 500)
  }

  // Fetch and shuffle questions
  const fetchAndShuffleQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const topicsQuery = selectedTopics.join(",")
      const vehicleQuery = selectedVehicle
      const apiUrl = "https://traffic-solve-cors-backend.vercel.app/api/questions"
      const response = await axios.get(apiUrl)
      if (response?.data) {
        const filteredQuestions = response.data.filter(
          (question) =>
            question.vehicles.some((vehicle) => vehicle._id === vehicleQuery) &&
            topicsQuery.split(",").includes(question.topic._id)
        )
        
        const shuffledQuestions = shuffleArray(filteredQuestions)
        
        const vehicleUrl = `https://traffic-solve-cors-backend.vercel.app/api/vehicles/${selectedVehicle}`
        const responseVehicle = await axios.get(vehicleUrl)
        const vehicleName = responseVehicle?.data?.name
        const checkQuestionCategory = vehicleName.split(" ")[0]
        setVehicleCategory(checkQuestionCategory.toLowerCase())
        
        const includesCorD = checkQuestionCategory.toLowerCase().includes("c") ||
          checkQuestionCategory.toLowerCase().includes("d")
        const questionLimit = includesCorD ? 40 : 30
        const selectedQuestions = shuffledQuestions.slice(0, questionLimit)
        
        setExamQuestions(selectedQuestions)
        setUserAnswers(Array(selectedQuestions.length).fill(null))
        setCurrentQuestionIndex(0)
        setCorrectAnswers(0)
        setWrongAnswers(0)
        const examDuration = includesCorD ? 2400 : 1800
        setMaxExamTime(examDuration)
        setTimeLeft(0)
        setExamStarted(true)
        setShowResults(false)
        setIsExamTerminated(false)
      } else {
        setError("No questions found in the database.")
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
    if (examStarted && timeLeft < maxExamTime && !isExamTerminated && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev >= maxExamTime - 1) {
            clearInterval(timer)
            setShowFailModal(true)
            return maxExamTime
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(timer)
    } else if (examStarted && timeLeft >= maxExamTime && !isExamTerminated && !showResults) {
      setShowFailModal(true)
    }
  }, [timeLeft, maxExamTime, isExamTerminated, examStarted, showResults])

  // Navigation functions
  const goToNextQuestion = () => {
    if (userAnswers[currentQuestionIndex] === null) return
    
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      handleResultClick()
    }
  }

  const goToPrevQuestion = () => {
    let prevIndex = currentQuestionIndex - 1
    while (prevIndex >= 0) {
      if (userAnswers[prevIndex] !== null) {
        setCurrentQuestionIndex(prevIndex)
        return
      }
      prevIndex--
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

  // Handle terminate exam button click
  const handleTerminateExam = () => {
    const confirmTerminate = window.confirm("დარწმუნებული ხართ, რომ გსურთ გამოცდის შეწყვეტა?")
    if (confirmTerminate) {
      setIsExamTerminated(true)
      setShowResults(true)
    }
  }

  // Handle result submission
  const handleResultClick = () => {
    const allAnswered = userAnswers.every((answer) => answer !== null)
    if (!allAnswered) return
    
    setShowResults(true)
    setIsExamTerminated(true)
  }

  // Restart the exam with same questions
  const restartSameExam = () => {
    setIsExamTerminated(false)
    setShowResults(false)
    setCurrentQuestionIndex(0)
    setUserAnswers(Array(examQuestions.length).fill(null))
    setCorrectAnswers(0)
    setWrongAnswers(0)
    setTimeLeft(0)
    setShowFailModal(false)
    setExamStarted(true)
  }

  // Restart the exam with new questions
  const restartNewExam = () => {
    setIsExamTerminated(false)
    setShowResults(false)
    navigate("/", { replace: true })
    fetchAndShuffleQuestions()
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
      
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full relative">
        <div className="min-h-screen">
          {/* Main content area */}
          {!showResults ? (
            <>
              <div className="flex-1 flex">
                <div className="w-full">
                  {/* Main image and question area */}
                  <div className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${slideAnimation}`}>
                    <div className="relative h-[500px] flex-1">
                      <img
                        src={currentQuestion.photo || "https://static.vecteezy.com/system/resources/previews/040/519/146/non_2x/vehicle-traffic-at-traffic-signal-vector.jpg"}
                        alt="Question"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                        <p className="md:text-sm leading-relaxed mb-3 text-center text-[10px]">{currentQuestion.title}</p>
                      </div>
                    </div>
                    {/* Multiple choice options */}
                    <div className="bg-gray-800 text-white">
                      <div className="grid grid-cols-2">
                        {currentQuestion.options?.map((option, index) => {
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
                              className={`border-r border-b border-[#FFFFFF] md:p-4 p-1 cursor-pointer transition-colors ${bgClass}`}
                              onClick={() => handleAnswerClick(option)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="md:w-8 w-4 md:h-8 h-4 bg-[#FFFFFF] rounded flex items-center justify-center text-[#525352] font-extrabold p-2 md:text-xl text-xs">
                                  {index + 1}
                                </div>
                                <p className="md:text-sm text-[9px] text-justify leading-relaxed">{option}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
                <div className="flex flex-wrap gap-4 mb-7 items-center justify-center md:justify-start">
                  <div className="flex flex-col items-center gap-2 col-span-1">
                    <button className="bg-[#F0F2BD] text-[#008318] md:text-3xl text-2xl font-bold py-2 md:px-8 px-6 rounded">
                      {correctAnswers}
                    </button>
                    <p className="md:text-xs text-[9px]">სწორია</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 col-span-1">
                    <button className="bg-[#F0F2BD] text-[#F74354] md:text-3xl text-2xl font-bold py-2 md:px-8 px-6 rounded">
                      {wrongAnswers}
                    </button>
                    <p className="md:text-xs text-[9px]">მცდარია</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 col-span-1">
                    <button className="bg-[#F0F2BD] text-[#525352] md:text-3xl text-2xl font-bold py-2 md:px-8 px-6 rounded">
                      {currentQuestionIndex + 1}/<span className="text-sm">{examQuestions.length}</span>
                    </button>
                    <p className="md:text-xs text-[9px]">კითხვები</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 col-span-2">
                    <button className="flex bg-[#F0F2BD] text-[#525352] md:text-3xl text-2xl font-bold py-2 md:px-8 px-6 rounded">
                      00:{Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </button>
                    <p className="md:text-xs text-[9px]">დარჩენილი დრო</p>
                  </div>
                </div>
                <div className="flex flex-row justify-center md:justify-end flex-nowrap items-center -mt-14 md:-mt-10">
                  <div className="flex flex-col items-center">
                    <button
                      className="flex items-center gap-2 bg-[#535353] px-5 mr-2 rounded-lg cursor-pointer hover:bg-[#F0F2BD] hover:text-black transition-colors h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={moveQuestionToEnd}
                      disabled={slideAnimation !== ""}
                    >
                      <img src={backicon} alt="back" className="w-6 md:w-8" />
                      <p className="flex flex-col text-xs md:text-sm">
                        ბოლოსთვის მოტოვება
                      </p>
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="mb-2 h-4"></div>
                    <button
                      className={`flex items-center bg-[#F9E57C] text-black font-bold h-[60px] px-4 rounded-lg cursor-pointer hover:bg-[#F0F2BD] transition-colors ${
                        userAnswers[currentQuestionIndex] === null ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={goToNextQuestion}
                      disabled={userAnswers[currentQuestionIndex] === null}
                    >
                      <p className="text-sm text-center">
                        {currentQuestionIndex === examQuestions.length - 1 ? 
                          "შედეგების ნახვა" : 
                          "შემდეგი კითხვა"}
                      </p>
                      <img src={rightArrow} alt="next" className="w-8 h-6" />
                    </button>
                    <div className="mb-2">
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
                </div>
              </div>
              
              {/* Progress bar with question segments */}
              <div className="flex h-6 mt-4 relative">
                {Array.from({ length: examQuestions.length }).map((_, index) => {
                  const isAnswered = userAnswers[index] !== null
                  const isCorrect = isAnswered && userAnswers[index] === examQuestions[index]?.correctAnswer
                  const isCurrent = index === currentQuestionIndex
                  
                  let bgColor = "bg-gray-200"
                  if (isAnswered) {
                    bgColor = isCorrect ? "bg-green-500" : "bg-red-500"
                  } else if (isCurrent) {
                    bgColor = "bg-yellow-300"
                  }

                  return (
                    <div
                      key={index}
                      className={`flex-1 border-2 border-[#1a0909] relative ${bgColor} hover:bg-opacity-80 ${
                        isAnswered ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      onMouseEnter={() => isAnswered && setHoveredQuestionIndex(index)}
                      onMouseLeave={() => setHoveredQuestionIndex(null)}
                      onClick={() => {
                        if (isAnswered) {
                          setHoveredQuestionIndex(hoveredQuestionIndex === index ? null : index)
                        }
                      }}
                    >
                      {/* Question preview popup */}
                      {hoveredQuestionIndex === index && isAnswered && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-80 bg-white shadow-2xl overflow-hidden border-8 border-white">
                          <div className="relative h-48">
                            <img
                              src={
                                examQuestions[index]?.photo ||
                                "https://static.vecteezy.com/system/resources/previews/040/519/146/non_2x/vehicle-traffic-at-traffic-signal-vector.jpg"
                              }
                              alt="Question preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-bold">
                              {index + 1}/{examQuestions.length}
                            </div>
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
                          
                          <div className="p-3 border-b border-gray-300 bg-[#374151] text-center">
                            <p className="text-sm text-white font-medium">{examQuestions[index]?.title}</p>
                          </div>
                          
                          <div className="bg-gray-50">
                            {isCorrect ? (
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
                              <div className="grid grid-cols-2 gap-1">
                                <div className="bg-[#052029]/90 p-3 rounded border border-red-300">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center"></div>
                                    <p className="text-xs font-semibold text-white">{userAnswers[index]}</p>
                                  </div>
                                </div>

                                <div className="bg-[#00831D] p-3 rounded border border-green-300">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
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
                                    <p className="text-xs font-semibold text-white">{examQuestions[index]?.correctAnswer}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
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
                  )
                })}
              </div>
              
              <div className="h-20 my-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2 bg-[#303030] px-2 rounded-md flex justify-center items-center gap-2 h-16">
                  <img src={question1} alt="question" className="w-14 h-14" />
                  <p className="md:text-[13px] text-xs">
                    კულტურითი მინიშნება: არჩევა პანელის შიგთავსის შესვლა და დახურვა Enter-ს, ბეჭდვის ბლოკების მორგება — დაჭერა Space.
                  </p>
                </div>
                <div className="hidden md:block col-span-2 mt-5">
                  <div className="flex justify-end items-center gap-2 -mt-5">
                    <button
                      className="w-36 h-14 p flex items-center justify-center gap-2 bg-[#DEDEDE] px-4 rounded-md"
                      onClick={handleTerminateExam}
                    >
                      <img src={Prohibition} alt="prohibition" className="w-12 h-12" />
                      <p className="text-sm text-[#F74354] font-bold">ტესტის შეწყვეტა</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Results Display Section */
            <div className="mt-4 text-center">
              <div className="rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-3xl leading-10 font-bold text-[#FBE26F] mb-4">
                  {correctAnswers / examQuestions.length >= 0.8667 
                    ? "გილოცავთ! თქვენ წარმატებით დაფარეთ გამოცდა!" 
                    : "სამწუხაროდ, თქვენ ვერ გადალახეთ გამოცდა"}
                </h2>
                
                {/* Results statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#F0F2BD] text-[#008318] text-3xl font-bold py-2 px-6 rounded w-full">
                      {correctAnswers}
                    </div>
                    <p className="text-sm text-white">სწორია</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#F0F2BD] text-[#F74354] text-3xl font-bold py-2 px-6 rounded w-full">
                      {wrongAnswers}
                    </div>
                    <p className="text-sm text-white">მცდარია</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#F0F2BD] text-[#525352] text-3xl font-bold py-2 px-6 rounded w-full">
                      {examQuestions.length}
                    </div>
                    <p className="text-sm text-white">კითხვები</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#F0F2BD] text-[#525352] text-xl font-bold py-2 px-6 rounded w-full">
                      {Math.floor((correctAnswers / examQuestions.length) * 100)}%
                    </div>
                    <p className="text-sm text-white">შედეგი</p>
                  </div>
                </div>
                
                {/* Progress stepper showing correct/wrong answers */}
                <div className="flex h-6 mt-8 mb-8 relative">
                  {Array.from({ length: examQuestions.length }).map((_, index) => {
                    const isAnswered = userAnswers[index] !== null
                    const isCorrect = isAnswered && userAnswers[index] === examQuestions[index]?.correctAnswer
                    
                    let bgColor = "bg-gray-200"
                    if (isAnswered) {
                      bgColor = isCorrect ? "bg-green-500" : "bg-red-500"
                    }

                    return (
                      <div
                        key={index}
                        className={`flex-1 border border-gray-800 ${bgColor}`}
                        title={`Question ${index + 1}: ${isCorrect ? 'Correct' : 'Wrong'}`}
                      />
                    )
                  })}
                </div>
                
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
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fail Modal */}
      {showFailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg text-center mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ვერ ჩააბარე!</h2>
            <div>
              {timeLeft >= maxExamTime ? (
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
              {timeLeft >= maxExamTime ? (
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
                restartSameExam()
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
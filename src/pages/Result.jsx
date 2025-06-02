import { useLocation, useNavigate } from "react-router-dom";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTopics, selectedVehicle, passStatus } = location.state || {};

  // Function to restart the exam
  const handleRestartExam = () => {
    if (!selectedTopics || !selectedVehicle) {
      alert("Unable to restart exam. Missing required data.");
      return;
    }

    // Navigate to the /exam route with the required state
    navigate("/exam", {
      state: {
        selectedTopics,
        selectedVehicle,
        fromHome: true, // Ensure this state is passed
      },
      replace: true, // Replace the current entry in the history stack
    });
  };

  // Function to go to the home page
  const handleGoToHome = () => {
    navigate("/");
  };

  // Function to print the result
  const handlePrintResult = () => {
    window.print();
  };

  return (
    <div className="bg-[#193E4A] min-h-screen w-full text-white p-4">
      {passStatus ? (
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-2xl font-bold mb-4">გილოცავ!</h3>
          <div className="flex justify-center items-center">
            <img
              src="https://res.cloudinary.com/deyqhzw8p/image/upload/v1740922652/ic24jwy5eaxacpxwm4rl.jpg"
              alt="Success"
              className="w-full md:w-90% mx-auto"
            />
          </div>
          <p>
            გილოცავ! თეორიული გამოცდა ჩათვალე ჩაბარებული გაქვს, წარმატებებს
            გისურვებ! �
          </p>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleGoToHome}
          >
            გადადით სახლში
          </button>
          <button
            className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={handlePrintResult}
          >
            ბეჭდვის შედეგი
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div>
            <img
              src="https://res.cloudinary.com/deyqhzw8p/image/upload/v1740923531/dfgkm2b92881lb0zqgfe.png"
              alt="Fail"
              className="w-full md:w-90% mx-auto"
            />
          </div>
          <p>
            არ დანებდე... კიდევ სცადე... ეცადე ის თემები გადაიმერო, რაც
            გერთულება. 🤩
          </p>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleRestartExam}
          >
            ახლიდან დაწყება
          </button>
        </div>
      )}
    </div>
  );
};

export default Result;

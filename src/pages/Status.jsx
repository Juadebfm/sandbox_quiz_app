import { useEffect } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoIosInformationCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Status = () => {
  const navigate = useNavigate();

  // Retrieve bodyData from local storage
  const bodyData = JSON.parse(localStorage.getItem("bodyData"));

  useEffect(() => {
    if (bodyData) {
      // Make API call with bodyData
      const apiUrl =
        "https://backend.pluralcode.institute/student/save-quiz-attempt";

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
        redirect: "follow",
      };

      fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log("API Call Result:", result);

          // You can perform additional actions based on the API response if needed
        })
        .catch((error) => console.log("API Call Error:", error));
    } else {
      console.log("No bodyData found in local storage.");
    }
  }, []); // Empty dependency array to ensure the effect runs only once on mount

  const handleViewResultClick = () => {
    // Set a flag in local storage to indicate the user is viewing the result
    localStorage.setItem("viewingResult", "true");

    // Navigate to the QuizPage
    navigate("/quiz");
  };

  return (
    <div className="px-16 flex flex-col items-center justify-center h-screen w-screen overflow-x-hidden">
      {bodyData && (
        <div className="w-full">
          <h1 className="text-[40px] font-font-gilroy-bold text-pc-blue">
            {bodyData.status.toLowerCase() === "passed"
              ? "Congratulations! You Passed!"
              : "Sorry, You Failed."}
          </h1>

          <p className="font-font-gilroy-bold text-pc-dark-gray text-[25px]">
            Score:{" "}
            <span
              className="ml-1 font-font-gilroy-bold"
              style={{
                color:
                  bodyData.status.toLowerCase() === "passed" ? "green" : "red",
              }}
            >
              {bodyData.score}%
            </span>
          </p>

          <div className="timer"></div>
          <div className="flex items-center justify-between mt-10 gap-6 font-font-gilroy-regular font-bold w-full py-7 border-b border-pc-light-gray">
            <span className="flex items-center justify-center gap-3 text-[17px]">
              <IoCheckmarkCircle className="text-[#008000] text-[25px]" />
              <span>Your Quiz Has Been Submitted</span>
            </span>
            <div className="space-x-6">
              <button
                onClick={handleViewResultClick}
                className="py-2 md:py-3 px-7 bg-[#CCCCCC] rounded-md font-normal w-[200px] h-[51px]"
              >
                View Result
              </button>
              <button className="py-2 md:py-3 px-7 bg-pc-orange font-normal rounded-md w-[200px] h-[51px]">
                Try Again
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-10 gap-6 font-font-gilroy-regular font-bold w-full py-7 border-b border-pc-light-gray">
            <span className="flex items-center justify-center gap-3 text-[17px]">
              <IoIosInformationCircle className="text-[#008000] text-[25px]" />
              <span>Passing Grade: 70% or higher</span>
            </span>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[12px]">Your Grade</span>
              <span className="text-[25px] text-[#008000]">
                {bodyData.score}%
              </span>
            </div>
          </div>
        </div>
      )}
      {/* You can render other components or content for the Status page here */}
    </div>
  );
};

export default Status;

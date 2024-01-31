import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const QuizPage = () => {
  const navigate = useNavigate();
  // State to store the quiz questions
  const [questions, setQuestions] = useState([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    // Fetch quiz data when the component mounts
    fetchQuizData();
  }, []);

  const fetchQuizData = () => {
    // Retrieve user information from local storage
    const storedUserData = localStorage.getItem("UserInfo");

    if (storedUserData) {
      const userData = JSON.parse(storedUserData);

      // Construct the API URL with the user's course_id
      const apiUrl = `https://backend.pluralcode.institute/student/get-quiz?course_id=${userData.course_id}`;

      // Make the API call
      fetch(apiUrl)
        .then((response) => response.json())
        .then((result) => {
          // Check if the API response contains the 'questions' array
          if (result && result.message && result.message.questions) {
            setQuestions(result.message.questions);
          } else {
            console.error("Invalid API response format");
          }
        })
        .catch((error) => console.error("Error fetching quiz data:", error));
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].answers[optionIndex];
    const correctOption = questions[questionIndex].correct_answers[0];

    console.log(`Question ${questionIndex + 1}:`);
    console.log("Selected Option:", selectedOption);
    console.log("Correct Option:", correctOption);

    // Update userAnswers array with the selected option
    const updatedUserAnswers = [...userAnswers];
    updatedUserAnswers[questionIndex] = selectedOption;
    setUserAnswers(updatedUserAnswers);

    // Update the selectedOption in the questions array to reflect the UI
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].selectedOption = optionIndex;
    setQuestions(updatedQuestions);

    // Check if all questions have been answered
    const allQuestionsAnswered = updatedUserAnswers.every(
      (answer) => answer !== undefined
    );

    // Update the submit button disabled state
    setIsSubmitDisabled(!allQuestionsAnswered);
  };

  // Function to calculate user's score
  const calculateUserScore = () => {
    let score = 0;

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = question.correct_answers[0];

      if (userAnswer === correctAnswer) {
        score += 1; // Increment score for each correct answer
      }
    });

    const percentageScore = (score / questions.length) * 100;
    const roundedScore = percentageScore.toFixed(0); // Round to 0 decimal places

    return roundedScore;
  };

  const handleSubmitQuiz = () => {
    // Calculate and log user's score
    const userScore = calculateUserScore();
    console.log("User's Score:", userScore);

    // Create the bodyData object
    const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
    const ipAddress = localStorage.getItem("IP");

    const bodyData = {
      name: userInfo.name,
      email: userInfo.email,
      phone_number: userInfo.phone_number,
      score: userScore,
      status: userScore >= 70 ? "passed" : "failed", // Adjust the threshold as needed
      course_id: userInfo.course_id,
      ip_address: ipAddress,
      quiz_attempt: {
        questions: userAnswers.map((answer, index) => {
          const question = questions[index];
          const correctAnswer = question.correct_answers[0];
          const questionData = {
            question: question.question,
            question_type: question.question_type,
            answers: question.answers,
            correct_answers: question.correct_answers,
            answer: [answer],
            failed: [answer !== correctAnswer],
          };
          return questionData;
        }),
      },
    };

    // Store bodyData in localStorage
    localStorage.setItem("bodyData", JSON.stringify(bodyData));

    // Perform any additional actions (e.g., API call) with user's score here

    // Redirect or navigate to the status page
    setTimeout(() => {
      navigate("/status");
    }, 2000);
  };

  return (
    <div className="w-full md:w-[80%] h-max mx-auto p-[25px] md:p-16">
      <h1 className="text-pc-blue text-[40px] font-bold mb-2 mt-8 md:mt-0">
        Quiz Page
      </h1>
      <h1 className="text-pc-blue text-[28px] font-bold mb-10 capitalize">
        Answer All Questions
      </h1>
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-4">
          <p className="font-bold mb-2 capitalize text-[18px]">{`${
            questionIndex + 1
          }. ${question.question}`}</p>
          <ol type="A" className="space-y-2 pl-4">
            {question.answers.map((answer, optionIndex) => (
              <li key={optionIndex} className="py-1">
                <input
                  type="radio"
                  id={`q${questionIndex + 1}-a${optionIndex}`}
                  name={`q${questionIndex + 1}`}
                  checked={question.selectedOption === optionIndex}
                  onChange={() =>
                    handleOptionSelect(questionIndex, optionIndex)
                  }
                />
                <label
                  className="pl-2 cursor-pointer"
                  htmlFor={`q${questionIndex + 1}-a${optionIndex}`}
                >
                  {answer}
                </label>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <div className="w-full flex items-center justify-center">
        <button
          className={`py-2 md:py-3 px-7 ${
            isSubmitDisabled
              ? "bg-[#CCCCCC] cursor-not-allowed"
              : "bg-pc-blue text-white cursor-pointer"
          } rounded-md font-normal w-full md:w-[35%] h-[51px] mt-10`}
          disabled={isSubmitDisabled}
          onClick={handleSubmitQuiz}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizPage;

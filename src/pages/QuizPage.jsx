import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const QuizPage = () => {
  const location = useLocation();

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isRetakeQuiz, setIsRetakeQuiz] = useState(false);
  // Add a state to track whether the submit button should be enabled
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(quizQuestions.length).fill(null)
  );

  // Function to get the correct answer for a question
  const getCorrectAnswer = (questionIndex) => {
    return quizQuestions[questionIndex].correct_answers;
  };

  // Function to update selected answer for a question
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(updatedAnswers);

    // Log the user's option and the correct answer(s)
    const userOption = String.fromCharCode(65 + optionIndex);
    const correctAnswers = getCorrectAnswer(questionIndex);

    console.log(`Question ${questionIndex + 1}:`);
    console.log(
      `User's Option: ${userOption}, Correct Answer(s): ${correctAnswers.join(
        ", "
      )}`
    );

    // Check if all questions are answered
    const allQuestionsAnswered = updatedAnswers.every(
      (answerIndex) => answerIndex !== null
    );
    setIsSubmitButtonDisabled(!allQuestionsAnswered);
  };

  // Define passing score as a constant
  const passingScore = 70; // Set the passing score to your desired value

  // Function to calculate the user's score
  const calculateScore = () => {
    let score = 0;

    // Iterate through each question
    quizQuestions.forEach((question, questionIndex) => {
      const correctAnswers = question.correct_answers.map((answer) =>
        question.answers.indexOf(answer)
      );

      // Check if the user's answer is correct
      if (
        selectedAnswers[questionIndex] !== undefined &&
        correctAnswers.includes(selectedAnswers[questionIndex])
      ) {
        score += 1;
      }
    });

    return score;
  };

  // Function to handle the submission of the quiz
  const handleSubmitQuiz = async () => {
    // Calculate the user's score
    const userScore = calculateScore();

    // Prepare user information from localStorage
    const userInfo = JSON.parse(localStorage.getItem("UserInfo"));

    // Extract IP address without quotation marks
    const userIP = localStorage.getItem("IP").replace(/"/g, "");

    // Prepare data to send to the API
    const postData = {
      name: userInfo.name,
      email: userInfo.email,
      phone_number: userInfo.phone_number, // Remove double quotes
      score: userScore,
      status: userScore >= passingScore ? "passed" : "failed",
      course_id: userInfo.course_id,
      ip_address: userIP, // Remove double quotes
      quiz_attempt: {
        questions: quizQuestions.map((question, questionIndex) => ({
          question: question.question,
          question_type: question.question_type,
          answers: question.answers,
          correct_answers: question.correct_answers,
          answer:
            selectedAnswers[questionIndex] !== undefined
              ? [question.answers[selectedAnswers[questionIndex]]]
              : [], // Include an empty array if the answer is undefined
          failed: [userScore < passingScore],
        })),
      },
    };

    // Log the data (you can remove this line in production)
    console.log("Data to send to API:", postData);

    // Send the data to the API (replace the URL with your actual API endpoint)
    try {
      const response = await fetch(
        "https://backend.pluralcode.institute/student/save-quiz-attempt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (response.ok) {
        console.log("Data sent successfully!");
      } else {
        console.error("Error sending data to API:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending data to API:", error.message);
    }

    // Add your logic for submitting the quiz here
    console.log("Quiz submitted!");
  };

  useEffect(() => {
    const quizResponse = localStorage.getItem("QuizResponse");

    if (!quizResponse) {
      console.log("QuizResponse not found in local storage");
      return;
    }

    try {
      const quizData = JSON.parse(quizResponse);

      if (
        quizData &&
        quizData.message &&
        quizData.message === "No record found"
      ) {
        // Make API call to fetch quiz questions
        setIsRetakeQuiz(false);
        fetchQuizQuestions();
      } else if (
        quizData &&
        quizData.quiz_questions &&
        quizData.quiz_questions.questions
      ) {
        // Use quizData directly for rendering questions
        console.log("QuizData:", quizData);
        setIsRetakeQuiz(true);
        setQuizQuestions(quizData.quiz_questions.questions);
      } else {
        console.error("Invalid QuizResponse format");
      }
    } catch (error) {
      console.error("Error parsing QuizResponse:", error);
    }
  }, []);

  const showGoBackButton =
    new URLSearchParams(location.search).get("viewResult") === "true";

  const fetchQuizQuestions = () => {
    // Make API call to fetch quiz questions
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://backend.pluralcode.institute/student/get-quiz?course_id=91",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log("Fetched Quiz Questions:", result);
        setIsRetakeQuiz(false);
        setQuizQuestions(result.message.questions);
      })
      .catch((error) => console.error("Error fetching quiz questions:", error));
  };

  return (
    <div className="w-full md:w-[80%] h-max mx-auto p-[25px] md:p-16">
      <h1 className="text-pc-blue text-[40px] font-bold mb-2 mt-8 md:mt-0">
        {isRetakeQuiz ? "Retake Quiz" : "Quiz"}
      </h1>
      <h1 className="text-pc-blue text-[28px] font-bold mb-10 capitalize">
        Answer All Questions
      </h1>
      {showGoBackButton && (
        <Link to="/scores">
          <button>Go back to scores</button>
        </Link>
      )}
      {quizQuestions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-4">
          <p className="font-bold mb-2 capitalize text-[18px]">
            {`${questionIndex + 1}. ${question.question}`}{" "}
            {/* Numbered question */}
          </p>
          <ul className="space-y-2 pl-4">
            {question.answers.map((answer, optionIndex) => (
              <li className="py-1" key={optionIndex}>
                <input
                  type="radio"
                  id={`q${questionIndex}o${optionIndex}`}
                  name={`question${questionIndex}`}
                  onChange={() =>
                    handleSelectAnswer(questionIndex, optionIndex)
                  }
                />
                <label
                  htmlFor={`q${questionIndex}o${optionIndex}`}
                  className="pl-2 cursor-pointer"
                >
                  {String.fromCharCode(65 + optionIndex)}. {answer}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        onClick={handleSubmitQuiz}
        disabled={isSubmitButtonDisabled}
        className={`${
          isSubmitButtonDisabled ? "bg-pc-light-gray" : "bg-pc-orange"
        } text-white px-4 py-2 rounded mt-4`}
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizPage;

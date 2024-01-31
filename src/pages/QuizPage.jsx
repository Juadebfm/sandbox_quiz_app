import { useEffect, useState } from "react";

const QuizPage = () => {
  // State to store the quiz questions
  const [questions, setQuestions] = useState([]);

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
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].selectedOption = optionIndex;
    setQuestions(updatedQuestions);
  };

  return (
    <div>
      <h1>Quiz Page</h1>
      {questions.map((question, questionIndex) => (
        <div key={questionIndex}>
          <p>{`${questionIndex + 1}. ${question.question}`}</p>
          <ol type="A">
            {question.answers.map((answer, optionIndex) => (
              <li key={optionIndex}>
                <input
                  type="radio"
                  id={`q${questionIndex + 1}-a${optionIndex}`}
                  name={`q${questionIndex + 1}`}
                  checked={question.selectedOption === optionIndex}
                  onChange={() =>
                    handleOptionSelect(questionIndex, optionIndex)
                  }
                />
                <label htmlFor={`q${questionIndex + 1}-a${optionIndex}`}>
                  {answer}
                </label>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};

export default QuizPage;

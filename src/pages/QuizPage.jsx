import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedResult = localStorage.getItem("Result");

    if (storedResult) {
      const result = JSON.parse(storedResult);

      if (result && result.message && result.message.questions) {
        const questionsWithNumber = result.message.questions.map(
          (question, index) => ({ ...question, number: index + 1 })
        );

        setQuestions(questionsWithNumber);
      }
    }
  }, []);

  useEffect(() => {
    const isViewingResult = localStorage.getItem("viewingResult");

    if (isViewingResult === "true") {
      // Highlight answers when viewing results
      const highlightAnswers = location.state?.highlightAnswers;
      setSelectedAnswers(
        highlightAnswers.reduce(
          (acc, question) => ({
            ...acc,
            [question.number]: question.answer[0],
          }),
          {}
        )
      );

      // Remove the flag from local storage
      localStorage.removeItem("viewingResult");
    }
  }, [location.state]);

  const handleOptionSelect = (questionNumber, selectedOption) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: selectedOption,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;

    questions.forEach((question) => {
      const questionNumber = question.number;
      const selectedOption = selectedAnswers[questionNumber];
      const correctAnswer = question.correct_answers[0];

      if (selectedOption === correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = (correctCount / totalQuestions) * 100;

    const roundedScore = Math.ceil(score / 10) * 10;

    const status = roundedScore >= 70 ? "Passed" : "Failed";

    const storedUserData = localStorage.getItem("UserInfo");
    const storedQuizResult = localStorage.getItem("QuizResult");
    const storedIP = localStorage.getItem("IP");

    if (storedUserData && storedQuizResult) {
      const userData = JSON.parse(storedUserData);

      const bodyData = {
        name: userData.name,
        email: userData.email,
        phone_number: userData.phone_number,
        score: roundedScore.toString(),
        status,
        course_id: userData.course_id,
        ip_address: storedIP,
        quiz_attempt: {
          questions: questions.map((question) => ({
            question: question.question,
            question_type: question.question_type,
            answers: question.answers,
            correct_answers: question.correct_answers,
            answer: [selectedAnswers[question.number]],
            failed: [
              selectedAnswers[question.number] !== question.correct_answers[0],
            ],
          })),
        },
      };

      const stringifyBodyData = JSON.stringify(bodyData);
      localStorage.setItem("bodyData", stringifyBodyData);

      console.log("Stored bodyData in local storage:", bodyData);

      navigate("/status");
    }
  };

  return (
    <div className="bg-pc-bg h-max w-screen flex flex-col items-start justify-center px-16 font-font-gilroy-regular overflow-x-hidden">
      <div className="w-[60%] m-auto mt-10">
        <h1 className="text-pc-blue font-font-gilroy-bold text-[30px] md:text-[37.43px] mt-10 md:mt-0">
          Quiz
        </h1>
        <h2 className="mt-10 text-[24px] font-font-gilroy-bold capitalize text-pc-blue mb-6">
          Answer the following questions
        </h2>
        <div className="w-full flex flex-col">
          {questions.map((question) => (
            <div key={question.number} className="my-4">
              <p className="font-font-gilroy-bold text-[18px]">
                {question.number}. {question.question}
              </p>
              <ul className="space-y-2 pl-4">
                {question.answers.map((answer, answerIndex) => (
                  <li key={answerIndex}>
                    <input
                      type="radio"
                      id={`q${question.number}-a${answerIndex}`}
                      name={`q${question.number}`}
                      value={answer}
                      checked={selectedAnswers[question.number] === answer}
                      onChange={() =>
                        handleOptionSelect(question.number, answer)
                      }
                      className="mr-1 cursor-pointer"
                    />
                    <label htmlFor={`q${question.number}-a${answerIndex}`}>
                      {answer}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            onClick={calculateScore}
            className="py-2 md:py-3 px-7 bg-pc-blue text-white rounded-md w-[40%] my-6 mx-auto"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

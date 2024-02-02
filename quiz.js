document.addEventListener("DOMContentLoaded", function () {
  // Get course_id from local storage
  const formDataString = localStorage.getItem("formData");
  const formData = JSON.parse(formDataString);
  const course_id = formData.course_id;

  // Reference to the loading message container
  const loadingContainer = document.querySelector(".quiz_container");

  // Show loading message
  loadingContainer.textContent = "Loading quiz...";

  // API call
  const apiUrl = `https://backend.pluralcode.institute/student/get-quiz?course_id=${course_id}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderQuiz(data.message.questions);
    })
    .catch((error) => {
      console.error("Error fetching quiz:", error);
      // Handle error - Display an error message or retry logic
      loadingContainer.textContent = "Failed to load quiz. Please try again.";
    });

  // Render quiz questions
  function renderQuiz(questions) {
    // Reference to the quiz container
    const quizContainer = document.querySelector(".quiz_container");

    // Clear loading message
    loadingContainer.textContent = "";

    // Variable to track answered questions
    let answeredQuestions = 0;

    questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");

      const questionText = document.createElement("h4");
      questionText.textContent = `${index + 1}. ${question.question}`;
      questionText.classList.add("question_title");
      questionDiv.appendChild(questionText);

      const answerList = document.createElement("ul");
      answerList.classList.add("questions");

      question.answers.forEach((answer) => {
        const answerItem = document.createElement("li");
        answerItem.classList.add("options");

        const radioButton = document.createElement("input");
        radioButton.classList.add("radio");
        radioButton.type = "radio";
        radioButton.name = `question_${index}`;
        radioButton.value = answer;
        radioButton.classList.add("hidden-radio"); // Add a class to hide the default radio button
        answerItem.appendChild(radioButton);

        const label = document.createElement("label");
        label.textContent = answer;
        label.addEventListener("click", () => {
          radioButton.checked = true;
          logSelection(question, answer);

          // Increment the answered questions count
          answeredQuestions++;

          // Check if all questions are answered
          if (answeredQuestions === questions.length) {
            createSubmitButton();
          }
        });
        answerItem.appendChild(label);

        // Highlight correct and incorrect selections for view_result=true
        if (isViewResultMode()) {
          highlightSelection(answerItem, question, index);
        }

        answerList.appendChild(answerItem);
      });
      questionDiv.appendChild(answerList);

      quizContainer.appendChild(questionDiv);
    });

    // Function to log selection and correct answer
    function logSelection(question, selectedAnswer) {
      console.log("Selected Option:", selectedAnswer);
      console.log("Correct Answer:", question.correct_answers[0]);
    }

    // Function to create and append submit button
    function createSubmitButton() {
      const submitButton = document.createElement("button");
      submitButton.textContent = "Submit";
      submitButton.classList.add("submit_button");
      submitButton.style.color = "white";

      // Add event listener for the submit button
      submitButton.addEventListener("click", () => {
        // Change submit button text to "Calculating" during API call
        submitButton.textContent = "Calculating";

        // Add functionality for calculating the user's score
        const userScore = calculateUserScore(questions);

        // Add functionality for saving the quiz attempt
        saveQuizAttempt(formData, questions, userScore);
      });

      // Append submit button to the quiz container
      quizContainer.appendChild(submitButton);
    }

    // Function to check if view_result=true is present in the URL
    function isViewResultMode() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("view_result") === "true";
    }

    // Function to highlight correct and incorrect selections
    function highlightSelection(answerItem, question, index) {
      const quizAttemptDataString = localStorage.getItem("quizAttemptData");
      const quizAttemptData = JSON.parse(quizAttemptDataString);

      if (quizAttemptData && quizAttemptData.quiz_attempt) {
        const userSelection =
          quizAttemptData.quiz_attempt.questions[index].answer[0];
        const correctAnswer = question.correct_answers[0];

        const radioButtons = answerItem.querySelectorAll(".radio");
        const selectedRadioButton = Array.from(radioButtons).find(
          (radio) => radio.value === userSelection
        );

        if (selectedRadioButton) {
          // Click the radio button for the selected option
          selectedRadioButton.checked = true;

          if (userSelection === correctAnswer) {
            // Highlight correct selection in green
            answerItem.style.backgroundColor = "rgba(144, 238, 144, 0.5)";
          } else {
            // Highlight incorrect selection in red
            answerItem.style.backgroundColor = "rgba(255, 99, 71, 0.5)";
          }
        }
      }
    }

    // Function to calculate user's score
    function calculateUserScore(questions) {
      let correctAnswers = 0;

      questions.forEach((question, index) => {
        const radioButtons = document.getElementsByName(`question_${index}`);
        const selectedAnswer =
          Array.from(radioButtons).find((radio) => radio.checked)?.value ||
          null;

        // Check if the selected answer is correct
        if (selectedAnswer === question.correct_answers[0]) {
          correctAnswers++;
        }
      });

      // Calculate the percentage and round it to the nearest whole number
      const userScore = (correctAnswers / questions.length) * 100;
      const roundedUserScore = Math.round(userScore);

      return roundedUserScore;
    }

    // Function to save quiz attempt data to local storage
    function saveQuizAttempt(formData, questions, userScore) {
      const quizAttemptData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        score: userScore,
        status: userScore >= 70 ? "passed" : "failed",
        course_id: formData.course_id,
        ip_address: formData.ip_address.replace(/"/g, ""),
        quiz_attempt: {
          questions: questions.map((question, index) => {
            const radioButtons = document.getElementsByName(
              `question_${index}`
            );
            const selectedAnswer =
              Array.from(radioButtons).find((radio) => radio.checked)?.value ||
              null;

            return {
              question: question.question,
              question_type: question.question_type,
              answers: question.answers,
              correct_answers: question.correct_answers,
              answer: [selectedAnswer],
              failed: [selectedAnswer !== question.correct_answers[0]],
            };
          }),
        },
      };

      console.log(quizAttemptData);

      // Save quiz attempt data to local storage
      localStorage.setItem("quizAttemptData", JSON.stringify(quizAttemptData));

      // Now you can call the API to save the quiz attempt
      saveQuizAttemptToAPI(quizAttemptData);
    }

    // Function to save quiz attempt data to the API
    function saveQuizAttemptToAPI(quizAttemptData) {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify(quizAttemptData),
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
      };

      // Change submit button text to "Submit" after the API call is complete
      const submitButton = document.querySelector(".submit_button");
      submitButton.textContent = "Submitting...";

      fetch(
        "https://backend.pluralcode.institute/student/save-quiz-attempt",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          console.log(result); // Change submit button text to "Submit" after the API call is done
          submitButton.textContent = "Submit";
          // Check if the API call was successful
          if (result === '{"message":"success"}') {
            // Navigate to the scores page (update the URL accordingly)
            window.location.href = "/score.html";
          }
        })
        .catch((error) => {
          console.log("error", error); // Handle error - you may want to display an error message or retry logic
          submitButton.textContent = "Submit";
        });
    }
  }

  // Function to create and append button to go back to the score page
  createBackToScoreButton();
  // Function to create and append button to go back to the score page
  function createBackToScoreButton() {
    // Check if the view_result parameter is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewResultParam = urlParams.get("view_result");

    // Only show the back button if view_result=true
    if (viewResultParam === "true") {
      const backButton = document.querySelector(".back_button");
      backButton.style.display = "block";
      backButton.addEventListener("click", () => {
        // Navigate back to the score page
        window.location.href = "/score.html";
      });
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let data; // Declare a variable to store the data globally
  let countdownInterval; // Variable to store the countdown interval ID
  let timeLeft = 120; // Set the countdown time in seconds (30 seconds for testing)

  // Get course_id from local storage
  const formDataString = localStorage.getItem("formData");
  const formData = JSON.parse(formDataString);
  const course_id = formData.course_id;

  // Reference to the countdown timer elements
  const countdownElement = document.getElementById("countdown");
  countdownElement.style.display="none"
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  // Update the countdown timer display
  function updateCountdownDisplay() {
    countdownElement.style.display="block"
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesElement.textContent = minutes.toString().padStart(2, "0");
    secondsElement.textContent = seconds.toString().padStart(2, "0");
  }

  // Function to start the countdown timer
  function startCountdown() {
    countdownInterval = setInterval(function () {
      if (timeLeft > 0) {
        timeLeft--;
        updateCountdownDisplay();
      } else {
        // Countdown has ended, stop the interval
        clearInterval(countdownInterval);
        // Calculate user's score and save the quiz attempt
        calculateAndSaveQuizAttempt();
      }
    }, 1000); // Update every 1 second
  }

  // Reference to the loading message container
  const loadingContainer = document.querySelector(".quiz_container");

  // Show loading message
  loadingContainer.textContent = "Loading quiz...";

  // API call
  const apiUrl = `https://backend.pluralcode.institute/student/get-quiz?course_id=${course_id}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      data = responseData; // Store the data globally
      renderQuiz(data.message.questions);
      // Check if view_result=true is present in the URL
      const isViewResult = isViewResultMode();

      // Disable countdown and hide submit button if view_result=true
      if (isViewResult) {
        disableCountdown();
        hideSubmitButton();
      } else {
        startCountdown(); // Start the countdown when the quiz data is loaded
      }
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

    // Create and append submit button after rendering questions
    createSubmitButton();
  }

  // Function to log selection and correct answer
  function logSelection(question, selectedAnswer) {
    console.log("Selected Option:", selectedAnswer);
    console.log("Correct Answer:", question.correct_answers[0]);
  }

  // Function to create and append submit button
  function createSubmitButton() {
    // Check if the submit button already exists
    const existingSubmitButton = document.querySelector(".submit_button");
    if (!existingSubmitButton) {
      const submitButton = document.createElement("button");
      submitButton.textContent = "Submit";
      submitButton.classList.add("submit_button");
      submitButton.style.color = "white";

      // Add event listener for the submit button
      submitButton.addEventListener("click", () => {
        // Change submit button text to "Calculating" during API call
        submitButton.textContent = "Calculating";

        // Add functionality for calculating the user's score
        const userScore = calculateUserScore(data.message.questions);

        // Add functionality for saving the quiz attempt
        saveQuizAttempt(formData, data.message.questions, userScore);
      });

      // Append submit button to the quiz container
      const quizContainer = document.querySelector(".quiz_container");
      quizContainer.appendChild(submitButton);
    }
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
        Array.from(radioButtons).find((radio) => radio.checked)?.value || null;

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
    const userScoreString = userScore.toString();

    const quizAttemptData = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number,
      score: userScoreString,
      status: userScore >= 70 ? "passed" : "failed",
      course_id: formData.course_id,
      ip_address: formData.ip_address.replace(/"/g, ""),
      quiz_attempt: {
        questions: questions.map((question, index) => {
          const radioButtons = document.getElementsByName(`question_${index}`);
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
    console.log(quizAttemptData.score);

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
          // Log a success message when the attempt is saved
          console.log("Quiz attempt successfully saved!");

          // Now, let's call the additional API to get retake_quiz and timeleft
          checkQuizStatus();
        }
      })
      .catch((error) => {
        console.log("error", error); // Handle error - you may want to display an error message or retry logic
        submitButton.textContent = "Submit";
      });

    // Function to check quiz status after a successful attempt
    function checkQuizStatus() {
      const checkQuizUrl = `https://backend.pluralcode.institute/student/check-quiz?ip_address=${quizAttemptData.ip_address}&email=${quizAttemptData.email}&course_id=${quizAttemptData.course_id}`;

      fetch(checkQuizUrl, { method: "GET", redirect: "follow" })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);

          // Check if the API response has retake_quiz and timeleft
          if (result.retake_quiz === false && result.timeleft) {
            console.log("User should wait", result.timeleft);

            // Append timeleft to the score page URL
            const currentUrl = window.location.href;
            const separator = currentUrl.includes("?") ? "&" : "?";
            const newUrl = `${currentUrl}${separator}timeleft=${result.timeleft}`;

            // Navigate to the scores page with the updated URL
            window.location.href = "/score.html";
          } else {
            // Navigate to the scores page with the updated URL
            window.location.href = "/score.html";
          }
        })
        .catch((error) => {
          console.log("Error checking quiz status:", error);
          // Handle error for the quiz status API call
        });
    }
  }

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

  // Create and append button to go back to the score page
  createBackToScoreButton();

  // Function to calculate user's score and save the quiz attempt
  function calculateAndSaveQuizAttempt() {
    // Stop the countdown interval (if not already stopped)
    clearInterval(countdownInterval);

    // Calculate user's score
    const userScore = calculateUserScore(data.message.questions);

    // Save quiz attempt data to local storage
    saveQuizAttempt(formData, data.message.questions, userScore);

    // Save quiz attempt data to API
    saveQuizAttemptToAPI(formData, data.message.questions, userScore);
  }

  // Function to disable the countdown
  function disableCountdown() {
    clearInterval(countdownInterval);
  }

  // Function to hide the submit button
  function hideSubmitButton() {
    const submitButton = document.querySelector(".submit_button");
    if (submitButton) {
      submitButton.style.display = "none";
    }
  }
});

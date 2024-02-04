document.addEventListener("DOMContentLoaded", function () {
  // Retrieve user's score percentage and timeleft from local storage
  const formDataString = localStorage.getItem("quizAttemptData");
  const formData = JSON.parse(formDataString);
  const userScore = formData.score;
  const course_id = formData.course_id;

  // Get the timeleft parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const timeleftParam = urlParams.get("timeleft");

  // Display user's score on the page
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = userScore + "%";

  // Display appropriate messages based on the user's score
  const congratsMessage = document.getElementById("congrats");
  const failedMessage = document.getElementById("failed");

  // Hide both messages initially
  congratsMessage.style.display = "none";
  failedMessage.style.display = "none";

  // Flag to determine if the "Try Again" button should be shown
  let showTryAgainButton = true;

  function convertMillisecondsToDHM(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    console.log("Converted to DHM:", {
      days,
      hours,
      minutes,
      remainingSeconds,
    });

    return { days, hours, minutes, remainingSeconds };
  }

  if (timeleftParam) {
    console.log("Timeleft parameter found:", timeleftParam);
    const timeLeftSeconds = parseInt(timeleftParam);
    displayTimeLeft(timeLeftSeconds);
  }

  // API call to check if the user can retake the quiz
  const checkQuizApiUrl = `https://backend.pluralcode.institute/student/check-quiz?ip_address=${formData.ip_address}&email=${formData.email}&course_id=${course_id}`;

  fetch(checkQuizApiUrl)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);

      // / Check if the user can retake the quiz
      if (result.retake_quiz === false) {
        // Display the countdown only if retake_quiz is false
        displayTimeLeft(result.timeleft, result.retake_quiz);
        // Hide "Try Again" button
        showTryAgainButton = false;
      } else {
        // User can retake the quiz, show "Try Again" button
        showTryAgainButton = true;
      }

      // // Display appropriate messages and set button visibility
      // updateUIBasedOnQuizStatus(showTryAgainButton);

        // Display appropriate messages and set button visibility
    updateUIBasedOnQuizStatus(showTryAgainButton, result.timeleft);
    })
    .catch((error) => {
      console.log("error", error);
      // Handle error - you may want to display an error message or retry logic
      // For now, assume the user can retake the quiz and show the "Try Again" button
      updateUIBasedOnQuizStatus(true);
    });

  // Event listener for "View Results" button
  const viewResultsButton = document.getElementById("view_results");
  viewResultsButton.addEventListener("click", function () {
    // Navigate to the quiz page with the "view_result=true" parameter
    window.location.href = "quiz.html?view_result=true";
  });

  // Event listener for "Try Again" button
  const tryAgainButton = document.getElementById("try_again");
  tryAgainButton.style.display = "none";
  tryAgainButton.addEventListener("click", function () {
    // Navigate to the quiz page with the "view_result=true" parameter
    window.location.href = "quiz.html";
  });

  // Function to update the UI based on the quiz status
  function updateUIBasedOnQuizStatus(showTryAgain) {
    if (userScore >= 70) {
      congratsMessage.style.display = "block";
      failedMessage.style.display = "none";
      scoreElement.style.color = "green";

      // If user passed with score above 70 and timeleft is null, hide the "Try Again" button
      tryAgainButton.style.display = timeleft === null ? "none" : "block";
    } else {
      congratsMessage.style.display = "none";
      failedMessage.style.display = "block";
      scoreElement.style.color = "red";
    }

    // Update the visibility of the "Try Again" button
    tryAgainButton.style.display = showTryAgain ? "block" : "none";
  }

  function displayTimeLeft(timeLeft) {
    console.log("Displaying time left:", timeLeft);

    const timeLeftElement = document.querySelector(".countDownElement");

    if (!timeLeftElement) {
      console.error("Error: countDownElement not found!");
      return;
    }

    function updateCountdown() {
      if (timeLeft > 0) {
        const countdown = convertMillisecondsToDHM(timeLeft);

        if (
          countdown.days > 0 ||
          countdown.hours > 0 ||
          countdown.minutes > 0
        ) {
          timeLeftElement.textContent = `Time left: ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.remainingSeconds} seconds`;
        } else if (countdown.remainingSeconds > 0) {
          timeLeftElement.textContent = `Time left: ${countdown.remainingSeconds} seconds`;
        }

        timeLeft -= 1000; // Subtract 1 second
      } else {
        console.log("No time left. Refreshing the page.");
        clearInterval(countdownInterval);
        // Refresh the page when timeLeft becomes 0
        window.location.reload();
      }
    }

    // Initial update
    updateCountdown();

    // Update the countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
  }
});

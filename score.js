document.addEventListener("DOMContentLoaded", function () {
  // Retrieve user's score percentage from local storage
  const formDataString = localStorage.getItem("quizAttemptData");
  const formData = JSON.parse(formDataString);
  const userScore = formData.score;

  console.log(formData.ip_address);

  // Display user's score on the page
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = userScore + "%";

  // Display appropriate messages based on the user's score
  const congratsMessage = document.getElementById("congrats");
  const failedMessage = document.getElementById("failed");

  // Flag to determine if the "Try Again" button should be shown
  let showTryAgainButton = true;

  // API call to check if the user can retake the quiz
  const checkQuizApiUrl = `https://backend.pluralcode.institute/student/check-quiz?ip_address=${formData.ip_address}&email=${formData.email}`;

  fetch(checkQuizApiUrl)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);

      // Check if the user can retake the quiz
      if (result.retake_quiz) {
        // Check if there is a countdown time
        if (result.message > 0) {
          // Display countdown and hide "Try Again" button
          showTryAgainButton = false;
          displayCountdown(result.message);
        } else {
          // Show "Try Again" button immediately
          showTryAgainButton = true;
        }
      } else {
        // User cannot retake the quiz, hide "Try Again" button
        showTryAgainButton = false;
      }

      // Display appropriate messages and set button visibility
      updateUIBasedOnQuizStatus(showTryAgainButton);
    })
    .catch((error) => {
      console.log("error", error);
      // Handle error - you may want to display an error message or retry logic
      // For now, assume user can retake the quiz and show the "Try Again" button
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
  tryAgainButton.addEventListener("click", function () {
    // Implement logic to reset the quiz and start again
    // You can decide what action to perform when the button is clicked
  });

  // Function to update the UI based on the quiz status
  function updateUIBasedOnQuizStatus(showTryAgain) {
    if (userScore >= 70) {
      congratsMessage.style.display = "block";
      failedMessage.style.display = "none";
      scoreElement.style.color = "green";
    } else {
      congratsMessage.style.display = "none";
      failedMessage.style.display = "block";
      scoreElement.style.color = "red";
    }

    // Update the visibility of the "Try Again" button
    tryAgainButton.style.display = showTryAgain ? "block" : "none";
  }

  // Function to display countdown
  function displayCountdown(countdownTime) {
    // Implement the countdown logic here
    // You can use setInterval or a countdown library to update the UI with the remaining time
    // Once the countdown finishes, show the "Try Again" button
  }
});

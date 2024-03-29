document.addEventListener("DOMContentLoaded", async function () {
  console.log("checki");
  const form = document.querySelector("form");
  const errorMessageDiv = document.querySelector(".error_message");
  const submitButton = document.querySelector(".btn_custom");

  const courseSelect = document.getElementById("select");

  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  // Fetch options from the API
  console.log("Before fetch");

  fetch("https://backend.pluralcode.institute/course-list", requestOptions)
    .then((response) => {
      console.log("Inside fetch then block");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Inside fetch success then block", data);

      if (data.diplomacourses && Array.isArray(data.diplomacourses)) {
        data.diplomacourses.forEach((course) => {
          const option = document.createElement("option");
          option.value = course.id;
          option.textContent = course.name;
          courseSelect.appendChild(option);
        });
      } else {
        console.log("After fetch - Invalid data format. 'diplomacourses' array not found.");
        console.error("Invalid data format. 'diplomacourses' array not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching courses:", error.message);
      console.error("Error fetching courses - Full error:", error);
      // Display error message to the user
      errorMessageDiv.textContent = "There was an error loading this page. Please try again later.";
    });

  // Validate and submit form
  form.addEventListener("submit", async function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Update submit button text to "Loading..."
    submitButton.textContent = "Loading...";

    // Validate each input and select
    const inputs = form.querySelectorAll("input");
    let formIsValid = true;

    // Object to store form data
    const formData = {
      name: "",
      email: "",
      phone_number: "",
      course_id: "",
      ip_address: "",
    };

    // Get the user's IP address before making the API request
    try {
      const ipResponse = await fetch(
        "https://ipinfo.io/json?token=3a43dc16a53806"
      );
      const ipJson = await ipResponse.json();
      formData.ip_address = ipJson.ip;
      console.log(formData.ip_address, ipJson.country);
    } catch (error) {
      console.error("Error getting IP address:", error.message);
      // Handle error if needed
    }

    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        formIsValid = false;
        highlightInput(input);
        input.addEventListener("input", function () {
          resetInput(input);
        });
      } else {
        resetInput(input);
        // Store data in formData object
        formData[input.name] = input.value.trim();
      }
    });

    if (courseSelect.value === "") {
      formIsValid = false;
      highlightInput(courseSelect);
      courseSelect.addEventListener("change", function () {
        resetInput(courseSelect);
      });
    } else {
      resetInput(courseSelect);
      // Store data in formData object
      formData.course_id = courseSelect.value;
    }

    // Save form data to local storage before API request
    saveFormDataToLocal(formData);

    // Display error message if the form is not valid
    if (!formIsValid) {
      errorMessageDiv.textContent = "Please fill out all required fields.";
      // Restore submit button text
      submitButton.textContent = "Proceed To Quiz";
    } else {
      // Clear the error message if the form is valid
      errorMessageDiv.textContent = "";

      // Show SweetAlert2 confirmation dialog
      const swalResult = await Swal.fire({
        title: '<strong>Information</strong>',
        text: 'Are you sure you are ready to begin the assessment? You will have exactly 20 minutes to complete the assessment. Ensure you have studied the material, and are in a quiet environment.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        confirmButtonColor:"#222057",
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#ff000',
      });

      if (swalResult.isConfirmed) {
        // Proceed to the quiz logic
        proceedToQuiz(formData);
      } else {
        // User clicked Cancel, reset submit button text
        submitButton.textContent = "Proceed To Quiz";
      }
    }
  });

  function proceedToQuiz(formData) {
    // Make API request to check if the user can retake the quiz
    const apiEndpoint = `https://backend.pluralcode.institute/student/check-quiz?ip_address=${formData.ip_address}&email=${formData.email}&course_id=${formData.course_id}`;

    fetch(apiEndpoint)
      .then(response => response.json())
      .then(result => {
        // Log the API response
        console.log("API Response:", result);

        // Continue with the rest of the logic (redirecting based on API response)
        if (result.retake_quiz === false) {
          // Save the API response to local storage for later use
          saveApiResultToLocal(result);

          // Redirect the user to score.html without adding timeleft to the URL if timeleft is null
          console.log("User should wait. Redirecting to score.html");
          if (result.timeleft !== null) {
            // Only add timeleft to the URL if it is not null
            window.location.href = `score.html`;
          } else {
            window.location.href = "score.html";
          }
        } else if (result.retake_quiz === true) {
          // Redirect the user to quiz.html
          console.log("User can retake the quiz. Redirecting to quiz.html");
          window.location.href = "quiz.html";
        } else if (result.message === "No record found") {
          // Redirect the user to quiz.html (or another page) for cases with "no record found"
          console.log("No record found. Redirecting to quiz.html");
          window.location.href = "quiz.html";
        } else {
          // Handle other cases if needed
          console.log("Unknown response. Do something else...");
        }
      })
      .catch(error => {
        console.error("Error checking quiz:", error.message);
      });
  }

  function saveFormDataToLocal(formData) {
    // Convert the formData object to a JSON string and save it to local storage
    localStorage.setItem("formData", JSON.stringify(formData));
  }

  function highlightInput(element) {
    element.style.border = "2px solid red";
  }

  function resetInput(element) {
    element.style.border = "1px solid var(--pc-light-gray)";
  }

  function saveApiResultToLocal(result) {
    localStorage.setItem("apiResult", JSON.stringify(result));
  }
});

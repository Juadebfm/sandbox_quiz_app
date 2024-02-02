document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const errorMessageDiv = document.querySelector(".error_message");
  const submitButton = document.querySelector(".btn_custom");

  const courseSelect = document.querySelector("select");

  // Fetch options from the API
  fetch("https://backend.pluralcode.institute/course-list")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      if (data.diplomacourses && Array.isArray(data.diplomacourses)) {
        data.diplomacourses.forEach((course) => {
          const option = document.createElement("option");
          option.value = course.id;
          option.textContent = course.name;
          courseSelect.appendChild(option);
        });
      } else {
        console.error("Invalid data format. 'diplomacourses' array not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching courses:", error.message);
    });

  // Validate and submit form
  form.addEventListener("submit", function (event) {
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

    // Display error message if the form is not valid
    if (!formIsValid) {
      errorMessageDiv.textContent = "Please fill out all required fields.";
      // Restore submit button text
      submitButton.textContent = "Proceed To Quiz";
    } else {
      // Clear the error message if the form is valid
      errorMessageDiv.textContent = "";

      // Get the user's IP address and log it to the console
      fetch("https://ipapi.co/json/")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error fetching IP address");
          }
          return response.json();
        })
        .then((data) => {
          // Log the IP address to the console
          console.log("User IP Address:", data.ip);

          // Store IP address in formData object
          formData.ip_address = data.ip;

          // Save the form data in local storage
          localStorage.setItem("formData", JSON.stringify(formData));

          // Navigate to the quiz page
          window.location.href = "quiz.html";

          // Proceed with other actions, e.g., quiz submission
          console.log("Form is valid. Proceeding to quiz.");
        })
        .catch((error) => {
          console.error("Error fetching IP address:", error.message);
        });
    }
  });

  function highlightInput(element) {
    element.style.border = "2px solid red";
  }

  function resetInput(element) {
    element.style.border = "1px solid var(--pc-light-gray)";
  }
});

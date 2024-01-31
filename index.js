document.addEventListener("DOMContentLoaded", function () {
  // Select element
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
      console.log(data); // Log the data to inspect its structure

      // Check if 'diplomacourses' exists and is an array
      if (data.diplomacourses && Array.isArray(data.diplomacourses)) {
        // Populate options in the select element
        data.diplomacourses.forEach((course) => {
          const option = document.createElement("option");
          option.value = course.id; // Adjust based on your data structure
          option.textContent = course.name; // Adjust based on your data structure
          courseSelect.appendChild(option);
        });
      } else {
        console.error("Invalid data format. 'diplomacourses' array not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching courses:", error.message);
    });
});

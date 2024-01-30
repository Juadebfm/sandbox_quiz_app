import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  const [courseList, setCourseList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    course: false,
  });

  useEffect(() => {
    const fetchCourseList = async () => {
      try {
        const response = await fetch(
          "https://backend.pluralcode.institute/course-list"
        );
        const data = await response.json();
        setCourseList(data.diplomacourses);
      } catch (error) {
        console.error("Error fetching course list:", error);
      }
    };

    fetchCourseList();
  }, []);

  const handleCourseChange = (e) => {
    const selectedValue = e.target.value;

    // Update the selectedCourseId when the user selects a different course
    setSelectedCourseId(selectedValue);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      course: selectedValue === "Select Your Course Of Interest",
    }));

    console.log("Selected Course ID:", selectedValue);
  };

  const handleProceedToQuiz = () => {
    // Validate the form before proceeding to the quiz
    const errors = {
      fullName: fullName === "",
      email: email === "",
      phone: phone === "",
      course:
        selectedCourseId === null ||
        selectedCourseId === "Select Your Course Of Interest",
    };

    setFormErrors(errors);

    // Display error message
    const errorMessages = Object.keys(errors)
      .filter((key) => errors[key])
      .map((key) => {
        const formattedKey =
          key === "fullName"
            ? "Full Name"
            : key.charAt(0).toUpperCase() + key.slice(1);
        return formattedKey;
      });

    if (errorMessages.length > 0) {
      console.log(`${errorMessages.join(", ")} is required.`);
    } else {
      // Proceed to the quiz
      console.log("Proceeding to the quiz!");

      // Save user information in local storage
      const userInfo = {
        name: fullName,
        email: email,
        phone_number: phone,
        course_id: selectedCourseId,
      };
      const stringifyUserInfo = JSON.stringify(userInfo);
      localStorage.setItem("UserInfo", stringifyUserInfo);

      const userIpAddress = localStorage.getItem("IP");

      // Check if the user already has quiz information
      const apiUrl = `https://backend.pluralcode.institute/student/check-quiz?ip_address=${userIpAddress}&email=${email}`;

      fetch(apiUrl, { method: "GET", redirect: "follow" })
        .then((response) => response.text())
        .then((result) => {
          console.log(result);

          // If the user has quiz information, navigate to the quiz page
          // Otherwise, navigate to the status page
          const isExistingUser = result === "existing_user";
          const pathToNavigate = isExistingUser ? "/quiz" : "/status";
          navigate(pathToNavigate);
        })
        .catch((error) => console.log("error", error));
    }
  };

  return (
    <div className="bg-pc-bg h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-pc-blue font-font-gilroy-bold text-[30px] md:text-[37.43px] mt-10 md:mt-0">
        Fill the form below
      </h1>
      {/* Display error messages */}
      {Object.values(formErrors).some((error) => error) && (
        <div className="text-red-500">
          {Object.keys(formErrors)
            .filter((key) => formErrors[key])
            .map((key) => {
              const formattedKey =
                key === "fullName"
                  ? "Full Name"
                  : key.charAt(0).toUpperCase() + key.slice(1);
              return formattedKey;
            })
            .join(", ")}{" "}
          is required.
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleProceedToQuiz();
        }}
        className="w-full md:w-[50%] text-small-text md:text-normal-text px-[25px] md:px-0 font-font-gilroy-regular mt-8 flex flex-col items-center space-y-6"
      >
        <div
          className={`flex flex-col items-start justify-center w-full space-y-2 ${
            formErrors.fullName ? "error" : ""
          }`}
        >
          <label htmlFor="name">Full Name</label>
          <input
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Enter Full Name"
            className={`w-full py-2 md:py-3 px-7 bg-pc-bg border ${
              formErrors.fullName ? "border-red-500" : "border-pc-dark-gray/35"
            } rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear`}
          />
        </div>
        <div
          className={`flex flex-col items-start justify-center w-full space-y-2 ${
            formErrors.email ? "error" : ""
          }`}
        >
          <label htmlFor="email">Email*</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Enter Email"
            className={`w-full py-2 md:py-3 px-7 bg-pc-bg border ${
              formErrors.email ? "border-red-500" : "border-pc-dark-gray/35"
            } rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear`}
          />
        </div>
        <div
          className={`flex flex-col items-start justify-center w-full space-y-2 ${
            formErrors.phone ? "error" : ""
          }`}
        >
          <label htmlFor="phone">Phone Number*</label>
          <input
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Enter Phone Number"
            className={`w-full py-2 md:py-3 px-7 bg-pc-bg border ${
              formErrors.phone ? "border-red-500" : "border-pc-dark-gray/35"
            } rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear`}
          />
        </div>
        <div
          className={`flex flex-col items-start justify-center w-full space-y-2 pb-5 ${
            formErrors.course ? "error" : ""
          }`}
        >
          <label htmlFor="course-of-interest">Course Of Interest</label>
          <div className="relative w-full">
            <select
              name="course-of-interest"
              id=""
              value={selectedCourseId || ""}
              onChange={handleCourseChange}
              className={`w-full py-2 md:py-4 px-7 bg-pc-bg border ${
                formErrors.course ? "border-red-500" : "border-pc-dark-gray/35"
              } rounded-lg font-font-gilroy-regular appearance-none focus:outline-none cursor-pointer`}
            >
              <option value="Select Your Course Of Interest">
                Select Your Course Of Interest
              </option>
              {Array.isArray(courseList) &&
                courseList.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                    className="font-font-gilroy-regular"
                  >
                    {course.name}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-pc-dark-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <button className="bg-pc-orange text-white py-2 md:py-4 px-7 w-full md:w-[70%]">
          Proceed To Quiz
        </button>
      </form>
    </div>
  );
};

export default Homepage;

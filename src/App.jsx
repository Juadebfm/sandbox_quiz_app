import { useState, useEffect } from "react";

export default function App() {
  // Course List State
  const [courseList, setCourseList] = useState([]);
  // Course ID State Management
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Course List API Call
  useEffect(() => {
    // Function to fetch course list from the API
    const fetchCourseList = async () => {
      try {
        const response = await fetch(
          "https://backend.pluralcode.institute/course-list"
        );
        const data = await response.json();
        // Assuming the API returns an object with a 'diplomacourses' property
        setCourseList(data.diplomacourses);
      } catch (error) {
        console.error("Error fetching course list:", error);
      }
    };

    // Call the function when the component mounts
    fetchCourseList();
  }, []);

  console.log("Course List:", courseList);

  const handleCourseChange = (e) => {
    // Update the selectedCourseId when the user selects a different course
    const selectedId = e.target.value;
    setSelectedCourseId(selectedId);
    console.log("Selected Course ID:", selectedId);
  };

  return (
    <div className="bg-pc-bg h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-pc-blue font-font-gilroy-bold text-[37.43px]">
        Fill the form below
      </h1>
      <form
        action=""
        className="w-[50%] font-font-gilroy-regular mt-8 flex flex-col items-center space-y-6"
      >
        <div className="flex flex-col items-start justify-center w-full space-y-2">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            placeholder="Enter Full Name"
            className="w-full py-3 px-7 bg-pc-bg border border-pc-dark-gray/35 rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear"
          />
        </div>
        <div className="flex flex-col items-start justify-center w-full space-y-2">
          <label htmlFor="email">Email*</label>
          <input
            type="text"
            placeholder="Enter Email"
            className="w-full py-3 px-7 bg-pc-bg border border-pc-dark-gray/35 rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear"
          />
        </div>
        <div className="flex flex-col items-start justify-center w-full space-y-2">
          <label htmlFor="phone">Phone Number*</label>
          <input
            type="tel"
            placeholder="Enter Phone Number"
            className="w-full py-3 px-7 bg-pc-bg border border-pc-dark-gray/35 rounded-lg focus:border-[2px] outline-none transition-all duration-150 ease-linear"
          />
        </div>
        <div className="flex flex-col items-start justify-center w-full space-y-2">
          <label htmlFor="course-of-interest">Course Of Interest</label>
          <div className="relative w-full">
            <select
              name="course-of-interest"
              id=""
              value={selectedCourseId || ""}
              onChange={handleCourseChange}
              className="w-full py-4 px-7 bg-pc-bg border border-pc-dark-gray/35 rounded-lg font-font-gilroy-regular appearance-none focus:outline-none cursor-pointer"
            >
              <option value="Select Your Course Of Interest" disabled>
                Select Your Course Of Interest
              </option>
              {/* Dynamically populate options based on the fetched courseList */}
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
              {/* Customize the chevron icon or any other element here */}
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
        <button className="bg-pc-orange text-white py-4 px-7 w-[70%]">
          Proceed To Quiz
        </button>
      </form>
    </div>
  );
}

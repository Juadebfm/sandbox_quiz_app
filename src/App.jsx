import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import QuizPage from "./pages/QuizPage";
import axios from "axios";
import { useEffect, useState } from "react";
import Status from "./pages/Status";

export default function App() {
  //creating IP state
  const [ip, setIP] = useState("");

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    console.log(res.data);
    setIP(res.data.ip);
  };

  useEffect(() => {
    //passing getData method to the lifecycle method
    getData();

    const stringIp = JSON.stringify(ip);
    localStorage.setItem("IP", stringIp);
  }, [ip]);
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Homepage />} />
        <Route exact path="/quiz" element={<QuizPage />} />
        <Route exact path="/status" element={<Status />} />
      </Routes>
    </Router>
  );
}

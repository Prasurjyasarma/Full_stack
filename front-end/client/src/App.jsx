import { Route, Routes } from "react-router-dom";
import MainPage from "./components/main_page/main_page";
import TaskCardHistory from "./components/history_page/history";
import Dashboard from "./components/dash_board/dash_board";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/history" element={<TaskCardHistory />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;

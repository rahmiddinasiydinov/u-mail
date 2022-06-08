import React from "react";
import { Routes, Route } from "react-router";
import "./App.scss";
import { Home } from "./Pages/Home/Home";
import { Login } from "./Pages/Login/Login";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/home/:name" element={<Home />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

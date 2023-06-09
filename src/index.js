import React from 'react';
import "./components/GrayButton/GrayButton.css";
import "./components/ProgressBar/ProgressBar.css";
import "./components/TimeBar/TimeBar.css";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home/Home';
import DotGame from './pages/DotGame/DotGame';
import reportWebVitals from './reportWebVitals';
import SignUp from './pages/SignUp/SignUp';
import { getCookie } from './utilities';
import MySocket from './socket';

// If  the user is logged in, create socket for them
if (getCookie("loggedIn") === "true") {
  MySocket.connect();
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dot-game" element={<DotGame />} />
        <Route path="/create-account" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

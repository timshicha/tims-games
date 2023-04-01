import "./Home.css";
import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import NavBar from "../../components/NavBar/Navbar";

function Home(props) {

    const sendMessage = () => {
        // socket.emit("message", "ms");
    }

    const login = () => {
        let username = document.getElementById("login-username").value;
        let password = document.getElementById("login-password").value;

        fetch(process.env.REACT_APP_API_BASE_URL + "/api/sessions/create", {
            method: "POST",
            body: JSON.stringify({ "username": username, "password": password }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            // If successful
            if (res.success) {
                console.log("Login successful.");
                console.log(res);
            }
            else {
                console.log("Could not log in.");
            }
        });
    }

    return (
        <>
            <NavBar />
            <div className="homepage-div">
                <p>Home</p>
                <Link to="/dot-game">Dot Game</Link>
                <br />
                <button onClick={sendMessage}>Send message</button>
            </div>
        </>
    );
}

export default Home;
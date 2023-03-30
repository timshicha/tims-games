import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { socket } from "../socket";

function Home() {

    const sendMessage = () => {
        socket.emit("message", "ms");
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
            Username:<input type="text" id="login-username"></input><br />
            Password:<input type="password" id="login-password"></input><br />
            <button onClick={login}>Login</button>


            <p>Home</p>
            <Link to="/signup">Login</Link><br />
            <Link to="/dot-game">Dot Game</Link>

            <button onClick={sendMessage}>Send message</button>
        </>
    );
}

export default Home;
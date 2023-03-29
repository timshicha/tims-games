import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
// import { socket } from "../socket";

function Home() {

    let accountCreationID = "";

    function createAccount() {
        let email = document.getElementById("email").value;
        let clearFields = document.getElementById("checkbox").checked;
        if (clearFields) {
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("email").value = "";
        }
        let abody = JSON.stringify({
            "email": email
        });

        fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-send-email", {
            method: "POST",
            body: abody,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            console.log(res);
            accountCreationID = res.accountCreationID;
        });
    }

    function sendCode() {
        let code = document.getElementById("code").value;

        fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-verify-email", {
            method: "POST",
            body: JSON.stringify({ "accountCreationID": accountCreationID, "code": code }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            console.log(res);
        });
    }

    function setUserPass() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-username-password", {
            method: "POST",
            body: JSON.stringify({ "accountCreationID": accountCreationID, username: username, password: password}),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            console.log(res);
        });
    }

    return (
        <>
            <p>Home</p>
            <Link to="/signup">Login</Link><br />
            {/* <form> */}
            Create an account:<br />
            Username:<input type="text" id="username" /><br />
            Password:<input type="password" id="password" /><br />
            <button onClick={setUserPass}>Create username and password</button><br />
            Email:<input type="email" id="email" /><br />
            Clear fields on submit:<input type="checkbox" id="checkbox" /><br />
            <button onClick={createAccount}>Create account</button><br />
            {/* </form> */}
            Code:<input type="text" id="code" /><br />
            <button onClick={sendCode}>Verify code</button><br />
            <Link to="/dot-game">Dot Game</Link>
        </>
    );
}

export default Home;
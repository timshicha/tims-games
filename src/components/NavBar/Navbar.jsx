import "./NavBar.css";
import GrayButton from "../GrayButton/GrayButton";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";


const NavBar = () => {

    const [loginExpanded, setLoginExpanded] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginErrorMsg, setLoginErrorMsg] = useState("");
    const loginExpandedRef = useRef(null);
    const loginFormRef = useRef(null);

    // Check if the user is logged in
    
    useEffect(() => {
        if (sessionStorage.getItem("expandLogin") === "true") {
            setLoginExpanded(true);
            sessionStorage.removeItem("expandLogin");
        }
    }, []);

    const expandLoginDiv = () => {
        setLoginExpanded(true);
        setLoginErrorMsg("");
    }

    const collapseLoginDiv = () => {
        setLoginExpanded(false);
        loginFormRef.current.reset();
        setLoginErrorMsg("");
    }

    const login = async (event) => {
        setLoginLoading(true);
        event.preventDefault();
        let username = event.target.username.value;
        let password = event.target.password.value;

        if (username == "") {
            setLoginErrorMsg("Please enter your username.");
        }
        else if (password === "") {
            setLoginErrorMsg("Please enter your password.");
        }
        else {

            await fetch(process.env.REACT_APP_API_BASE_URL + "/api/sessions/create", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ "username": username, "password": password }),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then(async (res) => {

                if (res.status === 200) {
                    res = await res.json();
                    // If successful
                    if (res.success) {
                        console.log("Login successful.");
                        loginFormRef.current.reset();
                    }
                    else {
                        setLoginErrorMsg(res.reason);
                    }
                }
                else if (res.status === 429) {
                    setLoginErrorMsg("You attempted to log in too many times too quickly. Please wait before trying again.");
                }
            }).catch(() => {
            });
        }
        setLoginLoading(false);
    }
    
    return (
        <>
            <div className={"dark-bg " + (loginExpanded ? "dark-bg-show" : "")} onClick={collapseLoginDiv} />
            <div className="navbar-container-div">
                <div className="navbar-div">
                    <div className="navbar-right-buttons-div">
                        <Link to="/create-account">
                            <GrayButton className="navbar-button">Create Account</GrayButton>
                        </Link>
                        <GrayButton id="navbar-login-button" className="navbar-button" onClick={expandLoginDiv}>Log In</GrayButton>
                    </div>
                </div>
            </div>
            {/* {loginExpanded && */}
            <div className="navbar-login-container">
                <div ref={loginExpandedRef} className={"navbar-login-div " + (loginExpanded ? "navbar-login-div-show" : "")}>
                    <form className="login-form" ref={loginFormRef} onSubmit={login}>
                        {/* <p className="login-form-title">Log In</p> */}
                        <p className="login-error-msg">{loginErrorMsg}</p>
                        <label htmlFor="login-username" className="login-form-text">Username or Email:</label>
                        <input type="text" className="login-input-field" id="login-username" name="username" placeholder="Username or Email"></input>
                        <label htmlFor="login-password" className="login-form-text" >Password:</label>
                        <input type="password" className="login-input-field" id="login-password" name="password" placeholder="Password"></input>
                        <div className="login-button-container">
                            <GrayButton type="submit" className="login-button" loading={loginLoading.toString()}>Log In</GrayButton>
                        </div>
                    </form>
                </div>
            </div>
            {/* } */}
        </>
    );
}

export default NavBar;
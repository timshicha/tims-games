import "./NavBar.css";
import GrayButton from "../GrayButton/GrayButton";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import sampleProfilePic from "../../assets/sample-profile-pic.svg";
import { getCookie } from "../../utilities.js";

const NavBar = () => {

    const [loginExpanded, setLoginExpanded] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginErrorMsg, setLoginErrorMsg] = useState("");
    const [loggedIn, setLoggedIn] = useState(getCookie("loggedIn") === "true" ? true : false);
    const [username, setUsername] = useState(getCookie("loggedIn") === "true" ? getCookie("username") : "");
    const [profileExpanded, setProfileExpanded] = useState(false);
    const loginExpandedRef = useRef(null);
    const loginFormRef = useRef(null);
    const [logoutLoading, setLogoutLoading] = useState(false);

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
                        collapseLoginDiv();
                        setLoggedIn(true);
                        setUsername(getCookie("username"));
                    }
                    else {
                        setLoginErrorMsg(res.reason);
                    }
                }
                else if (res.status === 429) {
                    setLoginErrorMsg("You attempted to log in too many times too quickly. Please wait before trying again.");
                }
            }).catch(() => {
                setLoginErrorMsg("A server error occured.");
            });
        }
        setLoginLoading(false);
    }

    const logout = async () => {
        setLogoutLoading(true);
        await fetch(process.env.REACT_APP_API_BASE_URL + "/api/sessions/destroy", {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(async (res) => {

            if (res.status === 200) {
                res = await res.json();
                // If successful
                if (res.success) {
                    console.log("Logout successful.");
                    setLoggedIn(false);
                    setProfileExpanded(false);
                    setLoggedIn(false);
                    setUsername("");
                }
                else {
                    console.log("Could not log out.");
                }
            }
            else if (res.status === 429) {
                setLoginErrorMsg("You attempted to log in too many times too quickly. Please wait before trying again.");
            }
        }).catch((err) => {
            console.log("A server error occured.");
        });
        setLogoutLoading(false);
    }

    const expandProfileDiv = () => {
        setProfileExpanded(true);
    }

    const handleBgClick = () => {
        collapseLoginDiv();
        setProfileExpanded(false);
    }
    
    return (
        <>
            <div className={"dark-bg " + (loginExpanded || profileExpanded ? "dark-bg-show" : "")} onClick={handleBgClick} />
                <div className="navbar-div">
                    <div className="navbar-right-buttons-div">
                        {loggedIn &&
                        <>
                            <GrayButton className="navbar-button navbar-dropdown-button" onClick={expandProfileDiv}>{username}<img src={sampleProfilePic} className="navbar-profile-image" /></GrayButton>
                        </>
                        }
                        {!loggedIn &&
                        <>
                            <Link to="/create-account">
                                <GrayButton className="navbar-button">Create Account</GrayButton>
                            </Link>
                            <GrayButton className="navbar-button" onClick={expandLoginDiv}>Log In</GrayButton>
                        </>
                        }
                    </div>
                </div>
            {/* Expanded login pop-up */}
            {/* {loginExpanded && */}
                <div className="navbar-login-container">
                    <div ref={loginExpandedRef} className={"navbar-login-div " + (loginExpanded ? "navbar-login-div-show" : "")}>
                        <form className="login-form" ref={loginFormRef} onSubmit={login}>
                            <p className="login-error-msg">{loginErrorMsg}</p>
                            <label htmlFor="login-username" className="login-form-text">Username or Email:</label>
                            <input type="text" className="login-input-field" id="login-username" name="username" placeholder="Username or Email"></input>
                            <label htmlFor="login-password" className="login-form-text" >Password:</label>
                            <input type="password" className="login-input-field" id="login-password" name="password" placeholder="Password"></input>
                            <div className="login-button-container">
                                <GrayButton type="submit" className="navbar-button login-button" loading={loginLoading.toString()}>Log In</GrayButton>
                            </div>
                        </form>
                    </div>
                </div>
            {/* } */}
            {/* Expanded profile pop-up */}
            <div className={"navbar-expanded-profile-container " + (profileExpanded ? "show" : "")}>
                <div className={"navbar-expanded-profile-div " + (profileExpanded ? "navbar-expanded-profile-div-show" : "")}>
                    <p className="login-error-msg">bad</p>
                    <GrayButton className="navbar-button" onClick={logout} loading={logoutLoading.toString()}>Log Out</GrayButton>

                </div>
            </div>
            {/* } */}
        </>
    );
}

export default NavBar;
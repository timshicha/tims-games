import "./SignUp.css";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import GrayButton from "../../components/GrayButton/GrayButton";

const SignUp = () => {

    const [emailClassName, setEmailClassName] = useState("signup-div-show");
    const [codeClassName, setCodeClassName] = useState("signup-div-hidden-right");
    const [userPassClassName, setUserPassClassName] = useState("signup-div-hidden-right");
    const [signupDivClassName, setSignupDivClassName] = useState("");
    const [signupSuccessDivClassName, setSignupSuccessDivClassName] = useState("");
    const [emailErrorMsg, setEmailErrorMsg] = useState(null);
    const [codeErrorMsg, setCodeErrorMsg] = useState(null);
    const [userPassErrorMsg, setUserPassErrorMsg] = useState(null);
    const [accountCreationID, setAccountCreationID] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [userPassLoading, setUserPassLoading] = useState(false);
    const codeRef = useRef(null);

    const showEmailDiv = () => {
        setEmailClassName("signup-div-show");
        setCodeClassName("signup-div-hidden-right");
        setUserPassClassName("signup-div-hidden-right");
        codeRef.current.value = "";
        setCodeErrorMsg(null);
        setUserPassErrorMsg(null);
    }
    
    const showCodeDiv = () => {
        setEmailClassName("signup-div-hidden-left");
        setCodeClassName("signup-div-show");
        setUserPassClassName("signup-div-hidden-right");
        setEmailErrorMsg(null);
        setUserPassErrorMsg(null);
    }

    const showUserPassDiv = () => {
        setEmailClassName("signup-div-hidden-left");
        setCodeClassName("signup-div-hidden-left");
        setUserPassClassName("signup-div-show");
        codeRef.current.value = "";
        setEmailErrorMsg(null);
        setCodeErrorMsg(null);
    }

    const submitEmail = async (event) => {
        setEmailLoading(true);
        event.preventDefault();
        let email = event.target.email.value;

        if (email === "") {
            setEmailErrorMsg("Please enter an email.");
        }
        else {
            await fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-send-email", {
                method: "POST",
                body: JSON.stringify({ email: email }),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(res => {
                // If successful, wipe in code page
                if (res.success === true) {
                    setAccountCreationID(res.accountCreationID);
                    showCodeDiv();
                }
                else {
                    setEmailErrorMsg(res.reason);
                }
                console.log(res);
            }).catch((err) => {
                setEmailErrorMsg("Server error. This may have happened if you sent too many requests too quickly. Please try waiting for one minute before trying again.");
            });
        }
        setEmailLoading(false);
    }

    const submitCode = async (event) => {
        setCodeLoading(true);
        event.preventDefault();
        let code = event.target.code.value;

        fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-verify-email", {
            method: "POST",
            body: JSON.stringify({ "accountCreationID": accountCreationID, "code": code }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            // If successful, wipe in username and password page
            if (res.success === true) {
                showUserPassDiv();
            }
            else {
                setCodeErrorMsg(res.reason);
            }
        });
        setCodeLoading(false);
    }

    const submitUserPass = async (event) => {
        setUserPassLoading(true);
        // Check if a username is legal. A username may only have
        // letters, numbers, and underscores and must be between 1
        // and 25 characters.
        const checkValidUsername = (username) => {
            if (username.length === 0 || username.length > 25) {
                return false;
            }
            let notAllowed = /[^a-zA-Z0-9_]/;
            return !notAllowed.test(username);
        }

        // Check if a password is legal. A password must be between
        // 8 and 50 characters.
        const checkValidPassword = (password) => {
            if (password.length < 8 || password.length > 50) {
                return false;
            }
            return true;
        }
        event.preventDefault();

        let username = event.target.username.value;
        let password = event.target.password.value;
        let confirmPassword = event.target.confirmPassword.value;

        if (!checkValidUsername(username)) {
            setUserPassErrorMsg("Invalid username. Username may have letters, numbers, and underscores, and must be between 1 and 25 characters.");
        }
        else if (!checkValidPassword(password)) {
            setUserPassErrorMsg("Invalid password. Password must be between 8 and 50 characters");
        }
        else if (password !== confirmPassword) {
            setUserPassErrorMsg("Passwords do not match.");
        }
        else {
            setUserPassErrorMsg(null);
            fetch(process.env.REACT_APP_API_BASE_URL + "/api/users/create-account-username-password", {
                method: "POST",
                body: JSON.stringify({ "accountCreationID": accountCreationID, username: username, password: password}),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(res => {
                if (res.success) {
                    event.target.username.value = "";
                    event.target.password.value = "";
                    event.target.confirmPassword.value = "";
                    successfulLoginTransform();
                }
                else {
                    setUserPassErrorMsg(res.reason);
                }
            });
        }

        setUserPassLoading(false);
    }

    const successfulLoginTransform = () => {
        setSignupDivClassName("signup-div-container-success");
        setUserPassClassName("signup-div-show signup-hidden");
        setTimeout(() => setSignupSuccessDivClassName("signup-success-div-show"), 1000);
    }

    function toggle() {
        console.log(userPassClassName);
        if (userPassClassName !== "signup-div-show") {
            showUserPassDiv();
            setSignupDivClassName("");
            setSignupSuccessDivClassName("");
        }
        else {
            successfulLoginTransform();
        }
    }

    return (
        <>

            <div className={"signup-div-container " + signupDivClassName}>

                {/* PROVIDE EMAIL DIV */}
                <div className={"signup-div " + emailClassName}>
                    <form className="signup-form" onSubmit={submitEmail}>
                        <p className="signup-title">Sign Up</p>
                        <div className="signup-form-area signup-space-above">
                            <p className="signup-error-msg signup-text-left">{emailErrorMsg}</p>
                            <label htmlFor="signup-email" className="signup-form-text signup-text-left">Enter your email:</label>
                            <input type="email" className="signup-input-field" id="signup-email" name="email" placeholder="example@email.com" />
                            <GrayButton type="submit" className="signup-submit-button" loading={emailLoading.toString()}>Send Code</GrayButton>
                        </div>
                    </form>
                    <div className="login-instead-div">
                        <p className="signup-form-text login-instead-text">Already have an account? <Link to="/" className="text-button">Log in</Link> instead.</p>
                    </div>
                </div>

                {/* CODE VERIFICATION DIV */}
                <div className={"signup-div " + codeClassName}>
                    <form className="signup-form" onSubmit={submitCode}>
                        <p className="signup-title">Verify Email</p>
                        <div className="signup-form-area signup-space-above">
                            <p className="signup-error-msg signup-text-left">{codeErrorMsg}</p>
                            <p className="signup-form-text signup-text-left">A 6-digit verification code was sent to your email.</p>
                            <label htmlFor="signup-code" className="signup-form-text signup-text-left">Enter the verification code:</label>
                            <input ref={codeRef} type="text" className="signup-input-field code-input-field" id="signup-code" name="code" placeholder="000000" maxLength={6} />
                            <GrayButton type="submit" className="signup-submit-button" loading={codeLoading.toString()}>Verify Code</GrayButton>
                        </div>
                    </form>
                    <div className="login-instead-div">
                        <p className="signup-form-text login-instead-text">Click <span onClick={showEmailDiv} className="text-button">here</span> to use a different email.</p>
                    </div>
                </div>

                {/* USERNAME AND PASSWORD DIV */}
                <div className={"signup-div " + userPassClassName}>
                    <form className="signup-form" onSubmit={submitUserPass}>
                        <p className="signup-title">Create Account</p>
                        <div className="signup-form-area">
                            <p className="signup-error-msg signup-text-left">{userPassErrorMsg}</p>
                            <label htmlFor="signup-username" className="signup-form-text signup-text-left">Create username:</label>
                            <input type="text" className="signup-input-field" id="signup-username" name="username" placeholder="new_username" />
                            <br />
                            <label htmlFor="signup-password" className="signup-form-text signup-text-left">Create a password:</label>
                            <input type="password" className="signup-input-field" id="signup-password" name="password" placeholder="Password" />
                            <label htmlFor="signup-confirm-password" className="signup-form-text signup-text-left">Confirm password:</label>
                            <input type="password" className="signup-input-field" id="signup-confirm-password" name="confirmPassword" placeholder="Confirm password" />
                            <GrayButton type="submit" className="signup-submit-button" loading={userPassLoading.toString()}>Create My Account</GrayButton>
                        </div>
                    </form>
                </div>

                <div className={"signup-success-div " + signupSuccessDivClassName}>
                    <p className="signup-success-title">Congratulations!</p>
                    <p className="signup-form-text signup-success-text">Your account was successfully created. You may now log in with your account.</p>
                    <Link to="/">
                        <GrayButton>Go To Home</GrayButton>
                    </Link>
                </div>

            </div>
            {/* <GrayButton onClick={toggle} loading={emailLoading.toString()} > Toggle</GrayButton > */}
        </>
    );
}

export default SignUp;
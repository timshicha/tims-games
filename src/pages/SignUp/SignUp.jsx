import "./SignUp.css";
import { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {

    const [emailClassName, setEmailClassName] = useState("signup-div-show");
    const [codeClassName, setCodeClassName] = useState("signup-div-hidden-right");
    const [userPassClassName, setUserPassClassName] = useState("signup-div-hidden-right");
    const [emailErrorMsg, setEmailErrorMsg] = useState(null);
    const [codeErrorMsg, setCodeErrorMsg] = useState(null);
    const [userPassErrorMsg, setUserPassErrorMsg] = useState(null);
    const [accountCreationID, setAccountCreationID] = useState(null);

    const showEmailDiv = () => {
        setEmailClassName("signup-div-show");
        setCodeClassName("signup-div-hidden-right");
        setUserPassClassName("signup-div-hidden-right");
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
        setEmailErrorMsg(null);
        setCodeErrorMsg(null);
    }

    const submitEmail = async (event) => {
        event.preventDefault();
        let email = event.target.email.value;

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
        });
    }

    const submitCode = async (event) => {
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
    }

    const submitUserPass = async (event) => {
        event.preventDefault();

        let username = event.target.username.value;
        let password = event.target.password.value;
        let confirmPassword = event.target.confirmPassword.value;

        console.log(username, password, confirmPassword);
    }

    function toggle() {
        if (codeClassName === "signup-div-show") {
            showUserPassDiv();
        }
        else {
            showCodeDiv();
        }
    }

    return (
        <>

            <div className="signup-div-container">

                {/* PROVIDE EMAIL DIV */}
                <div className={"signup-div " + emailClassName}>
                    <form className="signup-form" onSubmit={submitEmail}>
                        <p className="signup-title">Sign Up</p>
                        <div className="signup-form-area">
                            <p className="signup-error-msg signup-text-left">{emailErrorMsg}</p>
                            <label htmlFor="signup-email" className="signup-form-text signup-text-left">Enter your email:</label>
                            <input type="email" className="signup-input-field" id="signup-email" name="email" placeholder="example@email.com"/>
                            <button type="submit" className="signup-submit-button">Send Code</button>
                        </div>
                    </form>
                    <div className="login-instead-div">
                        <p className="signup-form-text login-instead-text">Already have an account? <Link to="/">Log in</Link> instead.</p>
                    </div>
                </div>

                {/* CODE VERIFICATION DIV */}
                <div className={"signup-div " + codeClassName}>
                    <form className="signup-form" onSubmit={submitCode}>
                        <p className="signup-title">Verify Email</p>
                        <div className="signup-form-area">
                            <p className="signup-error-msg signup-text-left">{codeErrorMsg}</p>
                            <p className="signup-form-text signup-text-left">A 6-digit verification code was sent to your email.</p>
                            <label htmlFor="signup-code" className="signup-form-text signup-text-left">Enter the verification code:</label>
                            <input type="text" className="signup-input-field code-input-field" id="signup-code" name="code" placeholder="000000" maxLength={6}/>
                            <button type="submit" className="signup-submit-button">Verify Code</button>
                        </div>
                    </form>
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
                            <button type="submit" className="signup-submit-button">Create My Account</button>
                        </div>
                    </form>
                </div>

            </div>
            <button onClick={toggle}>Toggle</button>
        </>
    );
}

export default SignUp;
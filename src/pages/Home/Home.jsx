import "./Home.css";
import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import NavBar from "../../components/NavBar/Navbar";
import { socketConnect, socketDisconnect, socketEmit } from "../../socket";
import { getCookie } from "../../utilities";

function Home(props) {

    const sendMessage = () => {
        socketEmit(document.getElementById("message").value);
    }

    const connectToSocket = async () => {
        socketConnect();
    }

    const disconnectFromSocket = () => {
        socketDisconnect();
    }

    return (
        <>
            <NavBar />
            <div className="homepage-div">
                <Link to="/dot-game">Dot Game</Link><br/><br/>
                <button onClick={connectToSocket}>Connect Web Socket</button><br/>
                <button onClick={disconnectFromSocket}>Disconnect Web Socket</button><br/><br/>
                <input type="text" id="message" /><br />
                <button onClick={sendMessage}>Send message</button><br/><br/>
            </div>
        </>
    );
}

export default Home;
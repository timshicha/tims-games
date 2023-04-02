import "./Home.css";
import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import NavBar from "../../components/NavBar/Navbar";
import MySocket from "../../socket";
import { getCookie } from "../../utilities";

function Home() {

    const sendMessage = () => {
        if (MySocket.isConnected()) {
            MySocket.getSocket().emit("message", document.getElementById("message").value);
        }
    }

    const connectToSocket = async () => {
        MySocket.connect();
    }

    const disconnectFromSocket = () => {
        MySocket.disconnect();
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
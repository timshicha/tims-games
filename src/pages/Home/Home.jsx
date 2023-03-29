import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
// import { socket } from "../socket";

function Home() {

    return (
        <>
            <p>Home</p>
            <Link to="/signup">Login</Link><br />
            <Link to="/dot-game">Dot Game</Link>
        </>
    );
}

export default Home;
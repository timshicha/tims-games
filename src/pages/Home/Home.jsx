import React, { useEffect, useState } from "react";
import { Link, Navigate, useLinkClickHandler, useNavigate } from "react-router-dom";

function Home() {

    // const [rendered, setRendered] = useState(null);

    // function setRedirect(to) {
    //     // Navigate
    //     setRendered(
    //         <Navigate replace to={to} />
    //     );
    // }

    // useEffect(() => {
    //     setRendered(
    //         <>
    //             <p>Home</p>
    //             <button onClick={() => setRedirect("/dot-game")}>Go to Dot game</button>
    //         </>
    //     );
    // }, []);

    // return rendered;

    return (
        <>
            <p>Home</p>
            <Link to="/dot-game">Dot Game</Link>
        </>
    )
}

export default Home;
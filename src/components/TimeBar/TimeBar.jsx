import { useEffect, useRef, useState } from "react";

const TimeBar = (props) => {

    const totalBarRef = useRef(null);
    const progressRef = useRef(null);
    const [show, setShow] = useState("full");
    
    useEffect(() => {
        console.log("Toggled");
        let bar = document.getElementById("time-bar-fill");
        bar.classList.add("full");
        void bar.offsetWidth;
        bar.classList.remove("full");
    }, [props.toggle]);

    // useEffect(() => {
    //     let bar = document.getElementById("time-bar-fill");
    //     bar.classList.add("full");
    //     void bar.offsetWidth;
    // }, []);
    

    
    return (
        <div className="time-bar-background" style={{height: "30px", background: props.bgcolor || "gray", width: props.width || "100px"}} ref={totalBarRef}>
            <div className={"time-bar-fill full"} style={{ background: props.color || "blue" }} ref={progressRef} id="time-bar-fill"></div>
        </div>
    );
}

export default TimeBar;
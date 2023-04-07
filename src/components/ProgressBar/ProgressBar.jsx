import { useEffect, useRef, useState } from "react";

const ProgressBar = (props) => {

    const totalBarRef = useRef(null);
    const progressRef = useRef(null);
    const [width, setWidth] = useState(props.width || "100");
    const [value, setValue] = useState(props.value || "50");
    const [max, setMax] = useState(props.max || "100");

    const calcFillWidth = () => {
        let width = parseFloat(props.width || "100");
        let value = parseFloat(props.value || "50");
        let max = parseFloat(props.max || "100");
        let fillWidth = value / max * width;
        console.log("Fill:", fillWidth);
        return fillWidth;
    }

    return (
        <div className="progress-bar-background" style={{height: "40px", background: props.bgcolor || "gray", width: parseFloat(props.width || "100")}} ref={totalBarRef}>
            <div className="progress-bar-fill" style={{ width: calcFillWidth(), background: props.color || "blue"}} ref={progressRef}></div>
        </div>
    );
}

export default ProgressBar;
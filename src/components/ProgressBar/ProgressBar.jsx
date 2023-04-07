import { useEffect, useRef, useState } from "react";

const ProgressBar = (props) => {

    const totalBarRef = useRef(null);
    const progressRef = useRef(null);
    const [width, setWidth] = useState(props.width || "100");
    const [value, setValue] = useState(props.value || "50");
    const [max, setMax] = useState(props.max || "100");

    const [totalWidth, setTotalWidth] = useState("40px");

    const calcFillWidth = () => {
        let width = totalBarRef.current.clientWidth;
        let value = 50;
        if (props.value !== undefined) {
            value = parseFloat(props.value);
        }
        console.log("value:", value, props.max);
        let max = parseFloat(props.max || "100");
        let fillWidth = value / max * width;
        return fillWidth + "px";
    }

    useEffect(() => {
        let resizeEvents = window.addEventListener("resize", () => {
            setTotalWidth(calcFillWidth);
        });
        setTotalWidth(calcFillWidth);

        return () => {
            window.removeEventListener("resize", resizeEvents);
        }
    }, []);

    useEffect(() => {
        setTotalWidth(calcFillWidth());
    }, [props.value]);

    return (
        <div className="progress-bar-background" style={{height: (props.height || "40px"), background: props.bgcolor || "gray", width: props.width || "100px"}} ref={totalBarRef}>
            <div className="progress-bar-fill" style={{ width: totalWidth, background: props.color || "blue", transition: props.transition || "width 0.5s"}} ref={progressRef}></div>
        </div>
    );
}

export default ProgressBar;
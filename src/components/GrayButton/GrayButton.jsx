import React from "react";
import { useEffect, useRef, useState } from "react";
import "./GrayButton.css";

const GrayButton = (props) => {

    const [loading, setLoading] = useState(false);

    const GrayButtonInner = (props) => {
        const loadingImgRef = useRef(null);
        const grayButtonRef = useRef(null);

        let deg = 0;
        let color = null;

        const rotateBg45Deg = () => {
            if (!loading) {
                return;
            }
            deg += 45;
            if (deg === 0) {
                deg = 0;
            }
            if (loadingImgRef.current) {
                loadingImgRef.current.style.transform = "rotate(" + deg + "deg)";
            }
        }

        useEffect(() => {
            const interval = setInterval(rotateBg45Deg, 100);
            return () => {
                clearInterval(interval);
            }
        }, []);

        useEffect(() => {
            // loading = props.loading;
            if (props.loading === "true") {
                setLoading(true);
                grayButtonRef.current.style.color = "transparent";
            }
            else {
                setLoading(false);
            }
        }, [props.loading]);

        return (
            <button ref={grayButtonRef} {...props} className={"gray-button-component " + props.className}>
                {loading && <div ref={loadingImgRef} className="gray-button-bg" />}
                {props.children}
            </button>
        );
    };

    return <GrayButtonInner {...props} />;
}

export default GrayButton;
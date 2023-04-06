import './DotGame.css';
import { useEffect, useState, useRef } from 'react';
import { findPathAndMatrix } from './path-alg';
import MySocket from '../../socket';
import GrayButton from "../../components/GrayButton/GrayButton";

const DEFAULT_SCALE = 20;

function DotGame() {
    
    // How many pixels each box should be
    const scale = 30;
    // How many boxes there should be
    let size = 18;
    // How big the circles should be
    let circleSize = scale;
    const gameDivRef = useRef(null);
    const canvasRef = useRef(null);
    const uiDivRef = useRef(null);
    const scaleSliderRef = useRef(null);
    const [searchGameText, setSearchGameText] = useState("");
    const [searching, setSearching] = useState(false);
    const [playerTerritory, setPlayerTerritory] = useState(0);
    const [uiBoard, setUiBoard] = useState(Array(size - 1).fill().map(() => Array(size - 1).fill()));
    var maxTerritory = (size - 2) * (size - 2);
    const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
    
    // Create the board
    var gameBoard = Array(size - 1);
    for (let i = 0; i < size - 1; i++) {
        gameBoard[i] = Array(size - 1);
        for (let j = 0; j < size - 1; j++) {
            gameBoard[i][j] = 0;
        }
    }
    
    useEffect(() => {
        
        if (MySocket.isConnected()) {
            MySocket.getSocket().off("dot-game-start");
            MySocket.getSocket().on("dot-game-start", (data) => {
                console.log("Data:", data);
                if (!data.success) {
                    return;
                }
                setSearchGameText("Game against " + data.opponent + ".");
            });
            
            MySocket.getSocket().off("dot-game-update");
            MySocket.getSocket().on("dot-game-update", (data) => {
                if (!data.success) {
                    return;
                }
                console.log("Data:", data);
                gameBoard = data.board;
                upDateCanvas();
            });
            
            MySocket.getSocket().off("dot-game-move");
            MySocket.getSocket().on("dot-game-move", () => {
                console.log("Your move");
            });

            MySocket.getSocket().off("dot-game-over");
            MySocket.getSocket().on("dot-game-over", (data) => {
                alert(data.reason);
            });
            
            MySocket.getSocket().off("dot-game-stop");
            MySocket.getSocket().on("dot-game-stop", (data) => {
                console.log(data);
                if (data.success) {
                    setSearching(false);
                    setSearchGameText("");
                }
                else {
                    setSearchGameText("You are already in a game");
                }
            });
        }

        resetUI();
        resetCanvas();
        adjustSlider();
        
        return () => {
            if (MySocket.getSocket() && MySocket.getSocket().connected) {
                MySocket.getSocket().off("dot-game-move");
                MySocket.getSocket().off("dot-game-start");
                MySocket.getSocket().off("dot-game-stop");
                MySocket.getSocket().off("dot-game-over");
                MySocket.getSocket().off("dot-game-update");
            }
        }
    }, []);
    
    // Clear canvas and draw the grid
    const resetCanvas = () => {
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.beginPath();
        // Draw horizontal lines
        for (let i = 1; i < size; i++) {
            context.moveTo(0, i * scale);
            context.lineTo(size * scale, i * scale);
        }
        // Draw vertical lines
        for (let i = 1; i < size; i++) {
            context.moveTo(i * scale, 0);
            context.lineTo(i * scale, size * scale);
        }
        context.strokeStyle = '#dddddd';
        context.stroke();
    }
    
    const upDateCanvas = () => {
        // Fill in a single square (or triangle) appropriately
        const fillSquare = (context, row, col, player, color) => {
            // If 3 corners are present, draw a triangle
            const drawTriangle = (context, coords1, coords2, coords3) => {
                context.beginPath();
                context.moveTo((coords1[1] + 1) * scale, (coords1[0] + 1) * scale);
                context.lineTo((coords2[1] + 1) * scale, (coords2[0] + 1) * scale);
                context.lineTo((coords3[1] + 1) * scale, (coords3[0] + 1) * scale);
                context.closePath();
                context.strokeStyle = color;
                context.fillStyle = color;
                context.stroke();
                context.fill();
            }
            
            let topLeft = gameBoard[row][col];
            let topRight = gameBoard[row][col + 1];
            let bottomRight = gameBoard[row + 1][col + 1];
            let bottomLeft = gameBoard[row + 1][col];
            
            // How many corners of this dot belong to the player
            let total = 0;
            if (topLeft === player) { total += 1 };
            if (topRight === player) { total += 1 };
            if (bottomRight === player) { total += 1 };
            if (bottomLeft === player) { total += 1 };
            // If all corners are filled in, draw a square
            if (total === 4) {
                context.beginPath();
                context.rect((col + 1) * scale, (row + 1) * scale, scale, scale);
                context.strokeStyle = color;
                context.fillStyle = color;
                context.stroke();
                context.fill();
            }
            // If all but one corner are filled in, draw a triangle
            else if (total === 3) {
                if (topLeft !== player) {
                    drawTriangle(context, [row, col + 1], [row + 1, col + 1], [row + 1, col]);
                }
                else if (topRight !== player) {
                    drawTriangle(context, [row, col], [row + 1, col + 1], [row + 1, col]);
                }
                else if (bottomRight !== player) {
                    drawTriangle(context, [row, col], [row, col + 1], [row + 1, col]);
                }
                else if (bottomLeft !== player) {
                    drawTriangle(context, [row, col], [row, col + 1], [row + 1, col + 1]);
                }
            }
        }
        
        // Set each corner to the appropriate color
        for (let i = 0; i < size - 1; i++) {
            for (let j = 0; j < size - 1; j++) {
                if (gameBoard[i][j] === 1) {
                    uiBoard[i][j].classList = 'circle-btn circle-btn-blue';
                }
                else if (gameBoard[i][j] === -1) {
                    uiBoard[i][j].classList = 'circle-btn circle-btn-green';
                }
            }
        }
        let context = canvasRef.current.getContext('2d');
        for (let i = 0; i < size - 2; i++) {
            for (let j = 0; j < size - 2; j++) {
                fillSquare(context, i, j, -1, "#00ff00");
                fillSquare(context, i, j, 1, "#0000ff");
            }
        }
    }
    
    // Reset (or set up) the UI
    const resetUI = () => {
        function clicked(x, y) {
            MySocket.getSocket().emit("dot-game-move", { x: x, y: y });
        }
        
        function createClickableCircle(x, y, x_coords = 0, y_coords = 0) {
            let obj = document.createElement('input');
            obj.type = 'button';
            obj.classList = 'circle-btn circle-btn-gray hover';
            obj.style.width = circleSize + "px";
            obj.style.height = circleSize + "px";
            obj.style.marginTop = x_coords - circleSize / 2 + "px";
            obj.style.marginLeft = y_coords - circleSize / 2 + "px";
            obj.onclick = () => clicked(x, y);
            return obj;
        }
        
        let ui = uiDivRef.current;
        while (ui.firstChild) {
            ui.removeChild(ui.firstChild);
        }
        console.log(ui.removeChild);
        ui.style.width = size * scale + "px";
        ui.style.height = size * scale + "px";
        
        // Make many buttons and make them clickable
        for (let i = 1; i < size; i++) {
            for (let j = 1; j < size; j++) {
                let circleUiBtn = createClickableCircle(i - 1, j - 1, i * scale, j * scale);
                uiBoard[i - 1][j - 1] = circleUiBtn;
                ui.append(circleUiBtn);
            }
        }
    }

    const searchGame = () => {
        if (!MySocket.isConnected()) {
            console.log("You are not connected.");
            return;
        }
        // Start searching
        if (!searching) {
            console.log("Starting search");
            setSearching(true);
            setSearchGameText("Searching for opponent...");
            MySocket.getSocket().emit("dot-game-start", {playWith: null});
        }
        // Stop searching
        else {
            console.log("Stopping search");
            MySocket.getSocket().emit("dot-game-stop");
        }
    }

    const toggleLeftSidebar = () => {
        setLeftSidebarExpanded(!leftSidebarExpanded);
    }

    const calculateDefaultBoardSize = () => {
        return window.innerHeight / (scale * size) * 0.9;
    }

    const adjustSlider = () => {
        let newScale = scaleSliderRef.current.value;

        let defaultScale = window.innerHeight / (scale * size) * 0.9;
        gameDivRef.current.style.transform = "scale(" + (newScale) + ")";

        // setScale(newScale);
        // resetUI(newScale);
        // resetCanvas(newScale);
    }

    return (
        <>
            <div className="dot-game-page">
                <div className={"games-page-container " + (leftSidebarExpanded ? "expanded" : "")}>
                    <div className="games-page-scroll-area">
                        <div className="left-sidebar-div">

                        </div>

                    </div>
                    <div className="games-page-game-container">
                        <div className="info-area">
                            <GrayButton onClick={() => { resetCanvas(); resetUI(); }}>Setup</GrayButton>
                            <GrayButton onClick={() => { toggleLeftSidebar() }}>Toggle Sidebar</GrayButton>
                                <p>You can win in the following ways:</p>
                            <ul>
                                <li>Control 20% of the territory first (your current territory: {Math.round(playerTerritory * 100 / maxTerritory * 100) / 100}%)</li>
                                <li>Control 20 more units than your opponent (you control: {playerTerritory})</li>
                                <li>Control more territory once all dots have been filled</li>
                            </ul>
                            <p className="search-game-text">{searchGameText}</p>
                            <GrayButton className="search-game-button" onClick={searchGame}>{searching ? "Cancel search" : "Search for opponent"}</GrayButton>
                            <input type="range" min="0.2" max="2" step="0.01" defaultValue={calculateDefaultBoardSize().toString()} ref={scaleSliderRef} onChange={adjustSlider}></input>

                        </div>
                        <div className="g-area" ref={gameDivRef}>
                            <div className="g-div" ref={uiDivRef}></div>
                            <canvas className='g-canvas' ref={canvasRef} width={scale * size} height={scale * size}/>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default DotGame;

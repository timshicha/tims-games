import './DotGame.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { findPathAndMatrix } from './path-alg';
import MySocket from '../../socket';
import GrayButton from "../../components/GrayButton/GrayButton";
import ProgressBar from "../../components/ProgressBar/ProgressBar";

const MAX_TIME_TO_MOVE = 5000;
const DEFAULT_SCALE = 20;
const COLOR1 = "#0000FF";
const COLOR2 = "#00FF00";

// Depending on the current state of the player, one of the following
// will be the text of the button.
const IDLE = "Search for opponent";
const SEARCHING = "Cancel search";
const IN_GAME = "Forfeit game";
const AFTER_GAME = "Play again";

let toggle = 0;

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
    const infoAreaRef = useRef(null);

    const [searchGameText, setSearchGameText] = useState("");
    const [playerState, setPlayerState] = useState(IDLE);
    const [uiBoard, setUiBoard] = useState(Array(size - 1).fill().map(() => Array(size - 1).fill()));
    const [youMove, setYouMove] = useState(false);
    const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
    const [player, setPlayer] = useState(1);
    const [youArea, setYouArea] = useState(0);
    const [opponentArea, setOpponentArea] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [countdownIDs, setCountdownIDs] = useState([]);
    
    // Create the board
    var gameBoard = Array(size - 1);
    for (let i = 0; i < size - 1; i++) {
        gameBoard[i] = Array(size - 1);
        for (let j = 0; j < size - 1; j++) {
            gameBoard[i][j] = 0;
        }
    }

    const newGameSetup = () => {
        resetCanvas();
        resetUI();
        setYouArea(0);
        setOpponentArea(0);
    }
    
    const adjustBoardSize = useCallback(() => {
        // Get height of area
        let maxHeight = window.innerHeight - 220;
        let maxWidth = window.innerWidth;
        let length = Math.min(maxHeight, maxWidth) * 0.95;
        let scale = length / 545;

        gameDivRef.current.style.transform = "scale(" + scale + ")";
        gameDivRef.current.style.left = "calc(50vw - 14px - " + length / 2 + "px)";
    });
    
    useEffect(() => {
        
        if (MySocket.isConnected()) {
            MySocket.getSocket().off("dot-game-start");
            MySocket.getSocket().on("dot-game-start", (data) => {
                console.log("Data:", data);
                if (!data.success) {
                    return;
                }
                newGameSetup();
                setPlayer(data.you);
                setPlayerState(IN_GAME);
                setSearchGameText("Game against " + data.opponent + ".");
            });
            
            MySocket.getSocket().off("dot-game-update");
            MySocket.getSocket().on("dot-game-update", (data) => {
                if (!data.success) {
                    return;
                }
                console.log("Data:", data);
                gameBoard = data.board;
                setYouArea(data.area.you);
                setOpponentArea(data.area.opponent);
                upDateCanvas();
            });
            
            MySocket.getSocket().off("dot-game-move");
            MySocket.getSocket().on("dot-game-move", (data) => {
                startCountDown();
                setYouMove(true);
            });

            MySocket.getSocket().off("dot-game-opponent-move");
            MySocket.getSocket().on("dot-game-opponent-move", (data) => {
                setYouMove(false);
            });

            MySocket.getSocket().off("dot-game-over");
            MySocket.getSocket().on("dot-game-over", (data) => {
                setSearchGameText(data.reason);
                setPlayerState(AFTER_GAME);
            });
            
            MySocket.getSocket().off("dot-game-stop");
            MySocket.getSocket().on("dot-game-stop", (data) => {
                console.log(data);
                if (data.success) {
                    setPlayerState(IDLE);
                    setSearchGameText("");
                }
                else {
                    setSearchGameText("You are already in a game");
                }
            });
        }

        newGameSetup();

        const adjustBoardSize = () => {
            // Get height of area
            let maxHeight = window.innerHeight - 220;
            let maxWidth = window.innerWidth;
            let length = Math.min(maxHeight, maxWidth) * 0.95;
            let scale = length / 545;
    
            gameDivRef.current.style.transform = "scale(" + scale + ")";
            gameDivRef.current.style.left = "calc(50vw - 14px - " + length / 2 + "px)";
        }
        // adjustBoardSize();

        window.addEventListener("resize", adjustBoardSize, true);
        
        return () => {
            MySocket.getSocket().emit("dot-game-stop");
            MySocket.getSocket().off("dot-game-move");
            MySocket.getSocket().off("dot-game-opponent-move");
            MySocket.getSocket().off("dot-game-start");
            MySocket.getSocket().off("dot-game-stop");
            MySocket.getSocket().off("dot-game-over");
            MySocket.getSocket().off("dot-game-update");
            window.removeEventListener("resize", adjustBoardSize, true);
        }
    }, []);

    const startCountDown = () => {
        stopCountDown();
        for (let i = 0; i <= 5; i++) {
            countdownIDs.push(setTimeout(() => setTimeLeft(5 - i), i * 1000));
        }
    }

    const stopCountDown = () => {
        for (let i = 0; i < countdownIDs.length; i++) {
            clearTimeout(countdownIDs[i]);
            setCountdownIDs([]);
        }
    }
    
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
                fillSquare(context, i, j, -1, COLOR2);
                fillSquare(context, i, j, 1, COLOR1);
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

    // Do something based on the player's state
    const handleMainClick = () => {
        // Make sure the player is connected
        if (!MySocket.isConnected()) {
            console.log("You are not connected.");
            return;
        }
        // If the player is idle, search for a game
        if (playerState === IDLE) {
            console.log("Searching.");
            setPlayerState(SEARCHING);
            MySocket.getSocket().emit("dot-game-start", { playWith: null });
        }
        // If the player is searchimg, attepmt to stop the search
        else if (playerState === SEARCHING) {
            console.log("Stopping.");
            MySocket.getSocket().emit("dot-game-stop");
        }
        // If the player is in game, forfeit
        else if (playerState === IN_GAME) {
            MySocket.getSocket().emit("dot-game-forfeit");
            console.log("Forfeit");
        }
        // If the player finished a game, search again 
        else {
            setPlayerState(SEARCHING);
            MySocket.getSocket().emit("dot-game-start", { playWith: null });
        }
    }

    const toggleLeftSidebar = () => {
        setLeftSidebarExpanded(!leftSidebarExpanded);
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
                        <div className="info-area" ref={infoAreaRef}>
                            <GrayButton onClick={() => { toggleLeftSidebar() }}>Toggle Sidebar</GrayButton>
                            <GrayButton className="search-game-button" onClick={handleMainClick}>{playerState}</GrayButton>
                            <p className="info-text-main">{searchGameText}</p>
                            <div className="info-stat-div">
                                <p className="info-text-div right">{youArea}</p>
                                <ProgressBar height="30px" width="40vw" max="40" value={Math.min(Math.max(youArea - opponentArea, -20), 20) + 20 + ""} color={player === 1 ? COLOR1 : COLOR2} bgcolor={player === 1 ? COLOR2 : COLOR1} />
                                <p className="info-text-div">{opponentArea}</p>

                            </div>
                            <p className="info-text-main">{playerState === IN_GAME ? (youMove ? ("Your turn: " + timeLeft): "Opponent's turn"): ""}</p>

                        </div>
                        <div className="g-area" ref={gameDivRef}>
                            <div className="g-div" ref={uiDivRef} style={{borderColor: (player === 1 ? COLOR1 : COLOR2)}}></div>
                            <canvas className='g-canvas' ref={canvasRef} width={scale * size} height={scale * size}/>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default DotGame;

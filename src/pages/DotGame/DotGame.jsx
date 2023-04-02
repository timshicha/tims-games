import './DotGame.css';
import { useEffect, useState } from 'react';
import { findPathAndMatrix } from './path-alg';
import MySocket from '../../socket';

function DotGame() {

  // How many pixels each box should be
  let scale = 35;
  // How many boxes there should be
  let size = 20;
  // How big the circles should be
  let circleSize = scale;

  useEffect(() => {
    
    if (MySocket.getSocket() && MySocket.getSocket().connected) {
      MySocket.getSocket().on("dot-game-start", (data) => {
        console.log("Data:", data);
      });

      MySocket.getSocket().on("dot-game-move", (data) => {
        console.log("Data:", data.board);
      });
    }

    return () => {
      if (MySocket.getSocket() && MySocket.getSocket().connected) {
        MySocket.getSocket().off("dot-game-start");
        MySocket.getSocket().off("dot-game-move");
      }
    }
  }, []);

  const [playerTerritory, setPlayerTerritory] = useState(0);

  let maxTerritory = (size - 2) * (size - 2);

  // Create the board
  let gameBoard = Array(size - 1);
  for (let i = 0; i < size - 1; i++) {
    gameBoard[i] = Array(size - 1);
    for (let j = 0; j < size - 1; j++) {
      gameBoard[i][j] = 0;
    }
  }

  let uiBoard = Array(size - 1);
  for (let i = 0; i < size - 1; i++) {
    uiBoard[i] = Array(size - 1);
  }

  function setupCanvas(path = null) {
    clear();
    let canvas = document.getElementById('g-canvas');
    let context = canvas.getContext('2d');
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

    // If a path was given, draw it
    if (path) {
      drawCanvasPath(path);
    }
  }

  function drawCanvasPath(path, color) {
    let canvas = document.getElementById('g-canvas');
    let context = canvas.getContext('2d');
    context.beginPath();
    // Draw the path
    context.moveTo((path[0][1] + 1) * scale, (path[0][0] + 1) * scale);
    for (let i = 1; i < path.length; i++) {
      context.lineTo((path[i][1] + 1) * scale, (path[i][0] + 1) * scale);
    }
    context.strokeStyle = "#0000ff";
    context.stroke();
  }

  // Fill square and return area (0, 0.5, or 1)
  function fillSquare(context, row, col) {
    function drawTriangle(context, coords1, coords2, coords3) {
      context.beginPath();
      context.moveTo((coords1[1] + 1) * scale, (coords1[0] + 1) * scale);
      context.lineTo((coords2[1] + 1) * scale, (coords2[0] + 1) * scale);
      context.lineTo((coords3[1] + 1) * scale, (coords3[0] + 1) * scale);
      context.closePath();
      context.strokeStyle = "#0000ff";
      context.fillStyle = "#0000ff";
      context.stroke();
      context.fill();
    }

    let topLeft = gameBoard[row][col];
    let topRight = gameBoard[row][col + 1];
    let bottomRight = gameBoard[row + 1][col + 1];
    let bottomLeft = gameBoard[row + 1][col];

    let total = topLeft + topRight + bottomRight + bottomLeft;
    // If all corners are filled in
    if (total === 4) {
      context.beginPath();
      // context.moveTo((row + 1) * scale, (col + 1) * scale);
      context.rect((col + 1) * scale, (row + 1) * scale, scale, scale);
      context.strokeStyle = "#0000ff";
      context.fillStyle = "#0000ff";
      context.stroke();
      context.fill();
      return 1;
    }
    // If all but one corner are filled in
    else if (total === 3) {
      if (topLeft === 0) {
        drawTriangle(context, [row, col + 1], [row + 1, col + 1], [row + 1, col]);
      }
      else if (topRight === 0) {
        drawTriangle(context, [row, col], [row + 1, col + 1], [row + 1, col]);
      }
      else if (bottomRight === 0) {
        drawTriangle(context, [row, col], [row, col + 1], [row + 1, col]);
      }
      else if (bottomLeft === 0) {
        drawTriangle(context, [row, col], [row, col + 1], [row + 1, col + 1]);
      }
      return 0.5;
    }
    return 0;
  }

  function setupUI() {
    function clicked(obj, x, y) {
      obj.classList = 'circle-btn circle-btn-blue';
      obj.style.width = scale + "px";
      obj.style.height = scale + "px";
      gameBoard[x][y] = 1;
      MySocket.getSocket().emit("dot-game-move", {x: x, y: y});
      // let paths = findPaths(gameBoard, [x, y]);
      // let pathMatrix = createPathMatrix(gameBoard, [x, y]);
      // console.log("Path matrix:", pathMatrix);
      let res = findPathAndMatrix(gameBoard, [x, y]);
      // fillMatrix(gameBoard, 1);
      console.log(gameBoard);
      let path = res[0];
      let filledMatrix = res[1];
      // console.log("Path that was found:", path);
      if(path && filledMatrix) {
        drawCanvasPath(path);
        for (let i = 0; i < size - 1; i++) {
          for (let j = 0; j < size - 1; j++) {
            if (filledMatrix[i][j] === 1) {
              gameBoard[i][j] = 1;
              uiBoard[i][j].classList = 'circle-btn circle-btn-blue';
            }
          }
        }
        let context = document.getElementById('g-canvas').getContext('2d');
        let totalArea = 0;
        for (let i = 0; i < size - 2; i++) {
          for (let j = 0; j < size - 2; j++) {
            totalArea += fillSquare(context, i, j);
          }
        }
        setPlayerTerritory(totalArea);
      }
    }

    function createClickableCircle(x, y, x_coords = 0, y_coords = 0) {
      let obj = document.createElement('input');
      obj.type = 'button';
      obj.classList = 'circle-btn circle-btn-gray hover';
      obj.style.width = circleSize + "px";
      obj.style.height = circleSize + "px";
      obj.style.marginTop = x_coords - circleSize / 2 + "px";
      obj.style.marginLeft = y_coords - circleSize / 2 + "px";
      obj.onclick = () => clicked(obj, x, y);
      return obj;
    }

    let ui = document.getElementById('g-div');
    ui.style.width = size * scale + "px";
    ui.style.height = size * scale + "px";

    for (let i = 1; i < size; i++) {
      for (let j = 1; j < size; j++) {
        let circleUiBtn = createClickableCircle(i - 1, j - 1, i * scale, j * scale);
        uiBoard[i - 1][j - 1] = circleUiBtn;
        ui.append(circleUiBtn);
      }
    }
  }

  function clear() {
    let canvas = document.getElementById('g-canvas');
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, size * scale, size * scale);
  }

  function joinGame() {
    MySocket.getSocket().emit("dot-game-start", {playWith: null});
  }

  return (
    <>
      <input type="button" className="circle-btn"></input>
      <div className="App">
        <input type="number" id="num"></input>
        <button onClick={() => setupCanvas()}>Set Up Canvas</button>
        <button onClick={() => setupUI()}>Set Up UI</button>
        <button onClick={() => clear()}>Clear</button>
        <button onClick={() => joinGame()}>Join game</button>
        <p>You can win in the following ways:</p>
        <ul>
          <li>Control 25% of the territory first (your current territory: {Math.round(playerTerritory * 100 / maxTerritory * 100) / 100}%)</li>
          <li>Control 20 more units than your opponent (you control: {playerTerritory})</li>
          <li>Control more territory once all dots have been filled</li>
        </ul>
        <div className="g-area">
          <canvas width={scale * size} height={scale * size} className='g-canvas' id='g-canvas' />
          <div className="g-div" id="g-div"></div>
        </div>
      </div>
      
    </>
  );
}

export default DotGame;

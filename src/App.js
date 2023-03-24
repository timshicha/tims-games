import './App.css';
import {findPaths} from './path-alg';

function App() {

  // How many pixels each box should be
  let scale = 40;
  // How many boxes there should be
  let size = 16;
  // How big the circles should be
  let circleSize = 40;

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

  function setupCanvas() {
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
  }

  function setupUI() {
    function clicked(obj, x, y) {
      obj.classList = 'circle-btn circle-btn-blue';
      gameBoard[x][y] = 1;
      console.log("Paths that were found:", findPaths(gameBoard, [x, y]));
    }

    function createClickableCircle(x, y, x_coords = 0, y_coords = 0) {
      let obj = document.createElement('input');
      obj.type = 'button';
      obj.classList = 'circle-btn circle-btn-gray';
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

  return (
    <>
      <input type="button" className="circle-btn"></input>
      <div className="App">
        <input type="number" id="num"></input>
        <button onClick={() => setupCanvas()}>Set Up Canvas</button>
        <button onClick={() => setupUI()}>Set Up UI</button>
        <button onClick={() => clear()}>Clear</button>
        <div className="g-area">
          <canvas width={scale * size} height={scale * size} className='g-canvas' id='g-canvas' />
          <div className="g-div" id="g-div"></div>
        </div>
      </div>
    </>
  );
}

export default App;

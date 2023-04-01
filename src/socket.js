const { getCookie } = require("./utilities");
const io = require("socket.io-client");

const URL = process.env.REACT_APP_API_BASE_URL;

let socket;
let socketConnected = false;

const socketConnect = (sessionID) => {
    // If the socket is already connected, ignore
    if (socketConnected) {
        return;
    }
    socket = io.connect(URL, { query: `userID=${getCookie("sessionID")}` });

    socket.on("connect", () => {
        console.log("Connected");
    });

    socketConnected = true;
}

const socketDisconnect = () => {
    // If the socket is already disconnected, ignore
    if (!socketConnected) {
        return;
    }
    socket.socketDisconnect();
}

module.exports = { socket, socketConnect, socketDisconnect };
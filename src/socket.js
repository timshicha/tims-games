const { getCookie } = require("./utilities");
const io = require("socket.io-client");

const URL = process.env.REACT_APP_API_BASE_URL;

let socket;
let socketConnected = false;

const socketConnect = (tempID) => {
    // If the socket is already connected, ignore
    if (socketConnected) {
        return;
    }
    socket = io.connect(URL, { withCredentials: true });

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
    socket.disconnect();
    socketConnected = false;
}

const socketEmit = (message) => {
    if (!socketConnected) {
        console.log("Cannot send message when socket is disconnected.");
        return;
    }
    socket.emit("message", message);
}

module.exports = { socketConnect, socketDisconnect, socketEmit };
const { getCookie } = require("./utilities");
const io = require("socket.io-client");

const URL = process.env.REACT_APP_API_BASE_URL;

let socket;
let socketConnected = false;

const getSocket = () => {
    return socket;
}

const connect = () => {
    // If the socket is already connected, ignore
    if (socketConnected) {
        return;
    }
    socket = io.connect(URL, { withCredentials: true }, console.log);

    socket.on("connect", () => {
        console.log("Connected");
    });

    socket.on("pre-disconnect", () => {
        socketConnected = false;
    });

    socketConnected = true;
}

const disconnect = () => {
    // If the socket is already disconnected, ignore
    if (!socketConnected) {
        return;
    }
    socket.disconnect();
    socketConnected = false;
}

const isConnected = () => {
    return socketConnected;
}

// Try automatically connecting if not connected
if (!socketConnected) {
    connect();
}

export default {
    getSocket: getSocket,
    connect: connect,
    disconnect: disconnect,
    isConnected: isConnected
};
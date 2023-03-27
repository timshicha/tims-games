const io = require("socket.io-client");

const URL = "ws://localhost:3000";

const socket = io.connect(URL, {query: "userID=1234"});

socket.on("connect", () => {
    console.log("Connected");
});


module.exports = { socket };
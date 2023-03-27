const io = require("socket.io-client");

const URL = process.env.REACT_APP_API_BASE_URL;


const socket = io.connect(URL, {query: "userID=1234"});
console.log(URL);

socket.on("connect", () => {
    console.log("Connected");
});


module.exports = { socket };
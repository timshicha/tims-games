const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "./env")
});

module.exports = {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL
}
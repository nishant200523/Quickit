const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/dbConnect");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute");
const chatRoute = require("./routes/chatRoute");
const statusRoute = require("./routes/statusRoute");
const http = require("http");
const initializeSocket = require("./services/socketService");

dotenv.config();

const PORT = process.env.PORT;
const app = express();

const corsOption = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOption));

//Middleware
app.use(express.json()); //parse body data
app.use(cookieParser()); //parse token on every request
app.use(bodyParser.urlencoded({ extended: true }));

//database connection
connectDb();

//create server
const server = http.createServer(app)

const io = initializeSocket(server)

//apply socket middleware before routes
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap
  next();
})

//routes
app.use('/api/auth',authRoute)
app.use('/api/chats',chatRoute)
app.use('/api/status', statusRoute)

server.listen(PORT, () => {
  console.log(`server running on this port ${PORT}`)
})

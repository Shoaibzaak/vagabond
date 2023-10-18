 require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var port = require("./config/config");
var connection = require("./connection/connection").connect;
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server,{
  cors: {
       origin: [ "http://localhost:3011","http://18.134.181.142:3000"],
    // credentials: true
    methods: ["GET", "POST"]
  }

}
);
app.set("io", io);
const SocketService = require("./services/socket");
var response = require("./response/index");
const logger = require("./services/LoggerService");

var api = require("./routes/routes");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  response.ok,
  response.fail,
  response.serverError,
  response.forbidden,
  response.notFound,
  response.badRequest
);
app.use(cors());
app.use("/api", api);
app.use("/uploads", express.static("./uploads"));
app.get("/healthcheck", (req, res) => {
  console.log("successfull");
  res.json("success");
});

//error handling middleware
const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  console.log(error);
  logger.error({
    statusCode: `${status}`,
    message: `${error.message}`,
    error: `${error}`,
    stackTrace: `${error.stack}`,
  });

  res.status(status).json({
    success: false,
    message: error.message,
  });
};
app.use(errorHandler);

connection((result) => {
  if (result) {
    server.listen(port.port, () => {
      console.log(`Server is running on port ${port.port}.`);
    });
  }
});

SocketService(io);

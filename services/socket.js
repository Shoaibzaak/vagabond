const mongoose = require("mongoose");
const Model = require("../models/index");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    socket.on("sendMessage", async (message) => {
      console.log(message);
     
    });
    socket.on("sendAdminMessage", async (message) => {
      console.log(message);
    });
  });
};

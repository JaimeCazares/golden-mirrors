const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("deuda_actualizada", () => {
    socket.broadcast.emit("actualizar_deudas");
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

server.listen(3000, () => {
  console.log("Socket corriendo en puerto 3000");
});

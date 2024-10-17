// utils/socketManager.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (groupId) => {
      socket.join(groupId);
      console.log(`User joined room: ${groupId} id:${socket.id}`);
    });

    socket.on("sendMessage", (messageData) => {
      const { groupId, message } = messageData;
      socket.to(groupId).emit("newMessage", message);
      console.log(
        `Message sent to group ${groupId}: ${message} id:${socket.id}`
      );
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

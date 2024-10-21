module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Khi người dùng join vào room
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Phát ra sự kiện để thông báo cho các user khác trong room
      socket.to(roomId).emit("user-connected", userId);

      // Xử lý khi người dùng rời phòng
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected from room ${roomId}`);
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    // Xử lý khi người dùng tham gia group chat
    socket.on("joinRoom", (groupId) => {
      socket.join(groupId);
      console.log(`User joined room: ${groupId} id:${socket.id}`);
    });

    // Xử lý việc gửi message
    socket.on("sendMessage", (messageData) => {
      const { groupId, message } = messageData;
      socket.to(groupId).emit("newMessage", message);
      console.log(
        `Message sent to group ${groupId}: ${message} id:${socket.id}`
      );
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

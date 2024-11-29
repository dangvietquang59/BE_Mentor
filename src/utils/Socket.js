// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     // console.log(`User connected: ${socket.id}`);

//     // Khi người dùng join vào room
//     socket.on("join-room", (roomId, userId) => {
//       socket.join(roomId);
//       // console.log(`User ${userId} joined room ${roomId}`);

//       // Phát ra sự kiện để thông báo cho các user khác trong room
//       socket.to(roomId).emit("user-connected", userId);

//       // Xử lý khi người dùng rời phòng
//       socket.on("disconnect", () => {
//         // console.log(`User ${userId} disconnected from room ${roomId}`);
//         socket.to(roomId).emit("user-disconnected", userId);
//       });
//     });

//     // Xử lý khi người dùng tham gia group chat
//     socket.on("joinRoom", (groupId) => {
//       socket.join(groupId);
//       // console.log(`User joined room: ${groupId} id:${socket.id}`);
//     });

//     // Xử lý việc gửi message
//     socket.on("sendMessage", (messageData) => {
//       const { groupId, message } = messageData;
//       socket.to(groupId).emit("newMessage", message);
//       console.log(
//         `Message sent to group ${groupId}: ${message} id:${socket.id}`
//       );
//     });

//     // Xử lý ngắt kết nối
//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });
// };
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining a room
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("user-connected", userId);

      // Handle toggling camera
      socket.on("toggle-camera", (isEnabled) => {
        console.log(`User ${userId} toggled camera: ${isEnabled}`);
        socket.to(roomId).emit("toggle-camera", userId, isEnabled);
      });

      // Handle toggling microphone
      socket.on("toggle-mic", (isEnabled) => {
        console.log(`User ${userId} toggled mic: ${isEnabled}`);
        socket.to(roomId).emit("toggle-mic", userId, isEnabled);
      });

      // Handle starting screen sharing
      socket.on("screen-share-start", (userId, roomId) => {
        console.log(`User ${userId} started screen sharing in room ${roomId}`);
        socket.to(roomId).emit("screen-share-start", userId);
      });

      // Handle stopping screen sharing
      socket.on("screen-share-stop", (userId, roomId) => {
        console.log(`User ${userId} stopped screen sharing in room ${roomId}`);
        socket.to(roomId).emit("screen-share-stop", userId);
      });

      // Handle user disconnecting
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected from room ${roomId}`);
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    // Handle joining a group chat
    socket.on("joinRoom", (groupId) => {
      socket.join(groupId);
      console.log(`User joined group chat: ${groupId} id:${socket.id}`);
    });

    // Handle sending a message in the chat
    socket.on("sendMessage", (messageData) => {
      const { groupId, message } = messageData;
      socket.to(groupId).emit("newMessage", message);
      console.log(
        `Message sent to group ${groupId}: ${message} id:${socket.id}`
      );
    });

    // Handle global disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected globally: ${socket.id}`);
    });
  });
};

export const disconnectHandler = (io, socket, connectedUsers) => {
  return () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log("Socket disconnected:", socket.id);
  };
};

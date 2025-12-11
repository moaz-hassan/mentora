export const checkOnlineStatusHandler = (io, socket, connectedUsers) => {
  return ({ userIds }) => {
    const onlineStatus = {};
    userIds.forEach((userId) => {
      onlineStatus[userId] = connectedUsers.has(userId);
    });
    socket.emit("online_status", onlineStatus);
  };
};

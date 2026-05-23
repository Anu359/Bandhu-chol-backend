const { Message } = require('../db/client');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
    
    socket.on('send-message', async (data) => {
      try {
        const { senderId, text, room, messageType, fileUrl, fileName, senderName } = data;
        
        const messageId = Date.now().toString() + Math.random().toString(36).substring(7);
        
        await Message.insert({
          _id: messageId,
          sender: senderId,
          text: text || '',
          room: room,
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          fileSize: 0,
          createdAt: new Date().toISOString()
        });
        
        const responseMessage = {
          _id: messageId,
          sender: senderId,
          text: text || '',
          room: room,
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          createdAt: new Date().toISOString(),
          senderName: senderName || 'User'
        };
        
        io.to(room).emit('receive-message', responseMessage);
      } catch (err) {
        console.error('Socket error:', err);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};
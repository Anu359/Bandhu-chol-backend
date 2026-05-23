const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
    
    socket.on('send-message', async (data) => {
      try {
        const { senderId, text, room, messageType, fileUrl, fileName } = data;
        
        const message = new Message({
          sender: senderId,
          text: text || '',
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          room: room
        });
        
        await message.save();
        const populatedMessage = await message.populate('sender', 'name');
        
        io.to(room).emit('receive-message', populatedMessage);
      } catch (err) {
        console.error(err);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};
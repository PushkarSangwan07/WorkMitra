require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const initSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Make io accessible in controllers/services via req.app.get('io')
app.set('io', io);

initSockets(io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`WorkMitra server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BookReaderAgent server running on port ${PORT}`);
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api/books`);
  console.log(`🎵 Audio files served at http://localhost:${PORT}/audio`);
  console.log(`🌐 Web interface at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server;


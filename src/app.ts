import express from 'express';
import cors from 'cors';
import path from 'path';
import { bookRoutes } from './routes/bookRoutes';
import { aiRoutes } from './routes/aiRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
// Try src/public first (development), then fall back to public (if populated)
app.use(express.static(path.join(__dirname, '../src/public')));

// Serve audio files from audio directory (including subdirectories)
app.use('/audio', express.static(path.join(__dirname, '../audio')));

// API routes
app.use('/api/books', bookRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'BookReaderAgent API'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import messRouter from './routes/messes';
import menuRouter from './routes/menus';
import reviewRouter from './routes/reviews';
import testRouter from './routes/test';
import everydayMenuRouter from './routes/everydayMenu';
import uploadRouter from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/auth', authRouter);

// Mess routes
app.use('/messes', messRouter);

// Menu routes
app.use('/menus', menuRouter);

// Menu routes (nested under messes - legacy)
app.use('/messes/:messId/menu', menuRouter);

// Everyday menu routes
app.use('/messes', everydayMenuRouter);
app.use('/everyday-menu', everydayMenuRouter);

// Review routes (nested under messes)
app.use('/messes/:messId/reviews', reviewRouter);
app.use('/reviews', reviewRouter);

// Upload routes
app.use('/upload', uploadRouter);

// Test routes (only for development)
app.use('/test', testRouter);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mess Finder API listening on port ${PORT}`);
  });
}

export default app;

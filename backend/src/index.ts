import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import messRouter from './routes/messes';
import menuRouter from './routes/menus';
import reviewRouter from './routes/reviews';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/auth', authRouter);

// Mess routes
app.use('/messes', messRouter);

// Menu routes (nested under messes)
app.use('/messes/:messId/menu', menuRouter);

// Review routes (nested under messes)
app.use('/messes/:messId/reviews', reviewRouter);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mess Finder API listening on port ${PORT}`);
  });
}

export default app;

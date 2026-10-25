import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import contactRoutes from './routes/contactRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { verifyEmailTransport } from './services/emailService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');
if (process.env.TRUST_PROXY) {
  const n = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isNaN(n) ? process.env.TRUST_PROXY : n);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Requests without an Origin header (curl, health checks) are not browser cross-site requests.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS_NOT_ALLOWED'));
    },
    methods: ['GET', 'POST'],
    maxAge: 600,
  })
);
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});
app.use('/api/contact', contactRoutes);
app.use('/api/careers', careerRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Entropy Soft API listening on port ${PORT}`);
  verifyEmailTransport();
});

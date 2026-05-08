import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import sessionsRoutes from './routes/sessions';
import userRoutes from './routes/user';
import photosRoutes from './routes/photos';
import statsRoutes from './routes/stats';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use(
  '/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'too many requests' })
);

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/user', userRoutes);
app.use('/photos', photosRoutes);
app.use('/stats', statsRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`rebuild server running on :${PORT}`);
});

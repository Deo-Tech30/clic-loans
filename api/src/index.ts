import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import agentRoutes from './routes/agent';
import traderRoutes from './routes/trader';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/trader', traderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clic-Loans Backend is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Clic-Loans Backend running on http://localhost:${PORT}`);
});

export default app;
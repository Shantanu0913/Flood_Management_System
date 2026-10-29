import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mainRoutes from './routes/mainRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

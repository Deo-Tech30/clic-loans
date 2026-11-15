import { Router } from 'express';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { name, phone, password, role } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Check if phone already exists
    const [existing]: any = await connection.execute(
      'SELECT id FROM users WHERE phone = ?', [phone]
    );
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // 2. Hash the password (security)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert into MySQL
    const [result]: any = await connection.execute(
      'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, phone, passwordHash, role]
    );

    await connection.end();
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import jwt from 'jsonwebtoken'; // <-- Add this to the top imports

// ... (keep your register route above) ...

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Find user by phone
    const [users]: any = await connection.execute(
      'SELECT * FROM users WHERE phone = ?', [phone]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const user = users[0];

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await connection.end();
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // 3. Generate JWT Token (valid for 1 day)
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' }
    );

    await connection.end();
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TRADER SELF-REGISTRATION
router.post('/register-trader', async (req, res) => {
  const { name, phone, password, market_id } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if phone exists
    const [existing]: any = await connection.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, phone, passwordHash, 'trader']
    );
    const userId = userResult.insertId;

    // Create Trader Profile (No Agent assigned yet)
    await connection.execute(
      'INSERT INTO traders (user_id, market_id, registered_by_agent_id) VALUES (?, ?, NULL)',
      [userId, market_id]
    );

    await connection.end();
    res.status(201).json({ message: 'Trader registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
import { Router } from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/authGuard';

dotenv.config();
const router = Router();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// GET AGENT'S MARKET & WALLET
router.get('/my-market', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [market]: any = await connection.execute(`
      SELECT m.name, m.location, a.wallet_balance 
      FROM markets m
      JOIN agents a ON m.id = a.market_id
      WHERE a.user_id = ?
    `, [req.user.id]);
    
    await connection.end();
    if (market.length === 0) return res.status(404).json({ error: 'Market not found' });
    res.json(market[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REGISTER TRADER
router.post('/traders', requireAuth(['agent']), async (req: any, res: any) => {
  const { name, phone, password } = req.body;
  const agentUserId = req.user.id;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agentRecord]: any = await connection.execute('SELECT id, market_id FROM agents WHERE user_id = ?', [agentUserId]);
    if (agentRecord.length === 0) { await connection.end(); return res.status(404).json({ error: 'Agent not found' }); }
    
    const agentId = agentRecord[0].id;
    const marketId = agentRecord[0].market_id;

    const [existing]: any = await connection.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) { await connection.end(); return res.status(400).json({ error: 'Phone already registered' }); }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [userResult]: any = await connection.execute(
      'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, phone, passwordHash, 'trader']
    );
    
    await connection.execute(
      'INSERT INTO traders (user_id, market_id, registered_by_agent_id) VALUES (?, ?, ?)',
      [userResult.insertId, marketId, agentId]
    );

    await connection.end();
    res.status(201).json({ message: 'Trader registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET MY TRADERS
router.get('/traders', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [traders]: any = await connection.execute(`
      SELECT t.id, u.name, u.phone 
      FROM traders t JOIN users u ON t.user_id = u.id JOIN agents a ON t.registered_by_agent_id = a.id
      WHERE a.user_id = ?
    `, [req.user.id]);
    await connection.end();
    res.json(traders);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// CREATE LOAN OFFER
router.post('/offers', requireAuth(['agent']), async (req: any, res: any) => {
  const { amount, interest_rate, duration_days } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agentRecord]: any = await connection.execute('SELECT id FROM agents WHERE user_id = ?', [req.user.id]);
    
    await connection.execute(
      'INSERT INTO loan_offers (agent_id, amount, interest_rate, duration_days, status) VALUES (?, ?, ?, ?, ?)',
      [agentRecord[0].id, amount, interest_rate, duration_days, 'active']
    );
    await connection.end();
    res.status(201).json({ message: 'Offer created' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// GET MY OFFERS
router.get('/offers', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [offers]: any = await connection.execute(`
      SELECT lo.id, lo.amount, lo.interest_rate, lo.duration_days, lo.status 
      FROM loan_offers lo JOIN agents a ON lo.agent_id = a.id WHERE a.user_id = ?
    `, [req.user.id]);
    await connection.end();
    res.json(offers);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// EDIT OFFER
router.put('/offers/:id', requireAuth(['agent']), async (req: any, res: any) => {
  const { amount, interest_rate, duration_days } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('UPDATE loan_offers SET amount = ?, interest_rate = ?, duration_days = ? WHERE id = ?', [amount, interest_rate, duration_days, req.params.id]);
    await connection.end();
    res.json({ message: 'Offer updated' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// DELETE OFFER
router.delete('/offers/:id', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM loan_offers WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ message: 'Offer deleted' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// GET ALL PENDING APPLICATIONS FOR THIS AGENT'S MARKET
router.get('/applications', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [apps]: any = await connection.execute(`
      SELECT la.id, la.status, la.purpose, u.name as trader_name, u.phone, lo.amount
      FROM loan_applications la
      JOIN loan_offers lo ON la.offer_id = lo.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON lo.agent_id = a.id
      WHERE a.user_id = ? AND la.status = 'pending'
    `, [req.user.id]);
    await connection.end();
    res.json(apps);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// APPROVE APPLICATION & CREATE LOAN
router.post('/approve/:appId', requireAuth(['agent']), async (req: any, res: any) => {
  const { appId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [appData]: any = await connection.execute(`
      SELECT la.id, lo.amount, lo.interest_rate, lo.duration_days 
      FROM loan_applications la JOIN loan_offers lo ON la.offer_id = lo.id WHERE la.id = ?
    `, [appId]);

    if (appData.length === 0) { await connection.end(); return res.status(404).json({ error: 'App not found' }); }

    const { amount, interest_rate, duration_days } = appData[0];
    const principal = Number(amount);
    const interest_amount = principal * (Number(interest_rate) / 100);
    const total_repayment = principal + interest_amount;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(duration_days));
    const dueDateStr = dueDate.toISOString().split('T')[0];

    await connection.beginTransaction();
    try {
      await connection.execute('UPDATE loan_applications SET status = "approved" WHERE id = ?', [appId]);
      await connection.execute(`
        INSERT INTO loans (application_id, principal, interest_amount, total_repayment, status, due_date)
        VALUES (?, ?, ?, ?, 'active', ?)
      `, [appId, principal, interest_amount, total_repayment, dueDateStr]);
      await connection.commit();
      await connection.end();
      res.status(200).json({ message: 'Loan approved' });
    } catch (error: any) {
      await connection.rollback();
      throw error;
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
// GET REPAYMENT HISTORY
router.get('/repayments', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [repayments]: any = await connection.execute(`
      SELECT r.id, r.amount_paid, r.agent_share, r.system_share, r.created_at, u.name as trader_name, l.total_repayment
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      WHERE a.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    await connection.end();
    res.json(repayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. GET AGENT ANALYTICS
router.get('/analytics', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get Agent ID and Wallet
    const [agentRec]: any = await connection.execute('SELECT id, wallet_balance FROM agents WHERE user_id = ?', [req.user.id]);
    if (agentRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Agent not found' }); }
    const agentId = agentRec[0].id;
    const walletBalance = agentRec[0].wallet_balance;

    // Total Disbursed (Sum of all active loans created by this agent)
    const [disbursed]: any = await connection.execute(`
      SELECT SUM(l.principal) as total_disbursed
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_offers lo ON la.offer_id = lo.id
      WHERE lo.agent_id = ?
    `, [agentId]);

    // Total Collected (Sum of all repayments on this agent's loans)
    const [collected]: any = await connection.execute(`
      SELECT SUM(r.amount_paid) as total_collected
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_offers lo ON la.offer_id = lo.id
      WHERE lo.agent_id = ?
    `, [agentId]);

    // Count of Active vs Completed Loans
    const [loanStats]: any = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_loans,
        COUNT(CASE WHEN l.status = 'fully_paid' THEN 1 END) as completed_loans
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_offers lo ON la.offer_id = lo.id
      WHERE lo.agent_id = ?
    `, [agentId]);

    await connection.end();
    
    res.json({
      wallet_balance: walletBalance,
      total_disbursed: disbursed[0].total_disbursed || 0,
      total_collected: collected[0].total_collected || 0,
      active_loans: loanStats[0].active_loans || 0,
      completed_loans: loanStats[0].completed_loans || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. GET TRADERS CRM (Detailed Directory)
router.get('/traders-crm', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get all traders registered by this agent, with their loan stats
    const [traders]: any = await connection.execute(`
      SELECT 
        u.id as trader_user_id,
        u.name,
        u.phone,
        u.created_at as joined_date,
        COUNT(DISTINCT l.id) as total_loans_taken,
        COALESCE(SUM(l.principal), 0) as total_borrowed,
        COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_loans
      FROM users u
      JOIN traders t ON u.id = t.user_id
      LEFT JOIN loan_applications la ON t.id = la.trader_id
      LEFT JOIN loans l ON la.id = l.application_id
      JOIN agents a ON t.registered_by_agent_id = a.id
      WHERE a.user_id = ?
      GROUP BY u.id, u.name, u.phone, u.created_at
      ORDER BY u.created_at DESC
    `, [req.user.id]);
    
    await connection.end();
    res.json(traders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 12. GET TRADERS WITH ACTIVE LOANS (For Reminders)
router.get('/reminders', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [reminders]: any = await connection.execute(`
      SELECT 
        u.name as trader_name, 
        u.phone as trader_phone, 
        l.total_repayment, 
        l.due_date,
        COALESCE((SELECT SUM(amount_paid) FROM repayments WHERE loan_id = l.id), 0) as paid_amount
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      WHERE a.user_id = ? AND l.status = 'active'
    `, [req.user.id]);
    
    await connection.end();
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. GET LOANS FOR RESTRUCTURING
router.get('/active-loans-list', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [loans]: any = await connection.execute(`
      SELECT l.id, l.due_date, l.total_repayment, u.name as trader_name
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      WHERE a.user_id = ? AND l.status = 'active'
    `, [req.user.id]);
    await connection.end();
    res.json(loans);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 14. EXTEND DUE DATE
router.put('/extend-loan/:id', requireAuth(['agent']), async (req: any, res: any) => {
  const { extra_days } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE loans SET due_date = DATE_ADD(due_date, INTERVAL ? DAY) WHERE id = ?', 
      [extra_days, req.params.id]
    );
    await connection.end();
    res.json({ message: `Due date extended by ${extra_days} days.` });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 15. GET AGENT PROFILE
router.get('/profile', requireAuth(['agent']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agentRec]: any = await connection.execute('SELECT id FROM agents WHERE user_id = ?', [req.user.id]);
    if (agentRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Agent not found' }); }
    
    const agentId = agentRec[0].id;
    const [profile]: any = await connection.execute(`
      SELECT p.*, u.name, u.phone 
      FROM agent_profiles p
      JOIN agents a ON p.agent_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE p.agent_id = ?
    `, [agentId]);
    
    await connection.end();
    if (profile.length === 0) {
      const [user]: any = await connection.execute('SELECT name, phone FROM users WHERE id = ?', [req.user.id]);
      return res.json({ name: user[0].name, phone: user[0].phone });
    }
    res.json(profile[0]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 16. UPDATE AGENT PROFILE
router.post('/profile', requireAuth(['agent']), async (req: any, res: any) => {
  const { business_name, momo_number, business_location } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agentRec]: any = await connection.execute('SELECT id FROM agents WHERE user_id = ?', [req.user.id]);
    if (agentRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Agent not found' }); }
    
    const agentId = agentRec[0].id;
    
    await connection.execute(`
      INSERT INTO agent_profiles (agent_id, business_name, momo_number, business_location) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        business_name = VALUES(business_name), 
        momo_number = VALUES(momo_number), 
        business_location = VALUES(business_location)
    `, [agentId, business_name, momo_number, business_location]);
    
    await connection.end();
    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
export default router;
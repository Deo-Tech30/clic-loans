import { Router } from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/authGuard';

dotenv.config();
const router = Router();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// 1. GET TRADER'S MARKET
router.get('/my-market', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [market]: any = await connection.execute(`
      SELECT m.name, m.location FROM markets m JOIN traders t ON m.id = t.market_id WHERE t.user_id = ?
    `, [req.user.id]);
    await connection.end();
    if (market.length === 0) return res.status(404).json({ error: 'Market not found' });
    res.json(market[0]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 2. GET AVAILABLE OFFERS
router.get('/offers', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get the trader's market
    const [traderRec]: any = await connection.execute('SELECT market_id FROM traders WHERE user_id = ?', [req.user.id]);
    if (traderRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Trader not found' }); }
    
    const marketId = traderRec[0].market_id;

    // Fetch ALL active offers in that market
    const [offers]: any = await connection.execute(`
      SELECT lo.id, lo.amount, lo.interest_rate, lo.duration_days, u.name as agent_name
      FROM loan_offers lo 
      JOIN agents a ON lo.agent_id = a.id 
      JOIN users u ON a.user_id = u.id
      WHERE a.market_id = ? AND lo.status = 'active'
    `, [marketId]);
    
    await connection.end();
    res.json(offers);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 3. APPLY FOR LOAN
router.post('/apply', requireAuth(['trader']), async (req: any, res: any) => {
  const { offer_id, purpose } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [traderRecord]: any = await connection.execute('SELECT id FROM traders WHERE user_id = ?', [req.user.id]);
    if (traderRecord.length === 0) { await connection.end(); return res.status(404).json({ error: 'Trader not found' }); }
    
    const traderId = traderRecord[0].id;
    
    // ONLY check if THIS specific trader has a pending or approved application
    const [existingApp]: any = await connection.execute(
      `SELECT la.id FROM loan_applications la WHERE la.trader_id = ? AND la.status IN ('pending', 'approved')`, 
      [traderId]
    );
    
    if (existingApp.length > 0) { 
      await connection.end(); 
      return res.status(400).json({ error: 'You already have an active or pending loan.' }); 
    }

    await connection.execute(
      'INSERT INTO loan_applications (offer_id, trader_id, status, purpose) VALUES (?, ?, ?, ?)', 
      [offer_id, traderId, 'pending', purpose || 'Not specified']
    );
    
    await connection.end();
    res.status(201).json({ message: 'Application submitted' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
   

// 4. GET MY APPLICATIONS
router.get('/applications', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [apps]: any = await connection.execute(`
      SELECT la.id, la.status, la.purpose, lo.amount, lo.interest_rate, u.name as agent_name
      FROM loan_applications la
      JOIN loan_offers lo ON la.offer_id = lo.id
      JOIN traders t ON la.trader_id = t.id
      JOIN agents a ON lo.agent_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE t.user_id = ? ORDER BY la.applied_at DESC
    `, [req.user.id]);
    await connection.end();
    res.json(apps);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 5. GET ACTIVE LOAN
router.get('/active-loan', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [loanRec]: any = await connection.execute(`
      SELECT l.id, l.principal, l.total_repayment, l.status, l.due_date, 
             COALESCE((SELECT SUM(amount_paid) FROM repayments WHERE loan_id = l.id), 0) as total_paid
      FROM loans l 
      JOIN loan_applications la ON l.application_id = la.id 
      JOIN traders t ON la.trader_id = t.id
      WHERE t.user_id = ? AND l.status = 'active' LIMIT 1
    `, [req.user.id]);
    await connection.end();
    if (loanRec.length === 0) return res.json(null);
    res.json(loanRec[0]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 6. MAKE REPAYMENT (With Early Repayment Discount)
router.post('/repay', requireAuth(['trader']), async (req: any, res: any) => {
  const { amount_paid } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [loanRec]: any = await connection.execute(`
      SELECT l.id, l.principal, l.interest_amount, l.total_repayment, a.id as agent_id, u.id as agent_user_id,
             COALESCE((SELECT SUM(amount_paid) FROM repayments WHERE loan_id = l.id), 0) as already_paid
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE t.user_id = ? AND l.status = 'active' LIMIT 1
    `, [req.user.id]);

    if (loanRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'No active loan found' }); }

    const loan = loanRec[0];
    const agentUserId = loan.agent_user_id;
    
    const remainingBalance = Number(loan.total_repayment) - Number(loan.already_paid);

    let final_amount_paid = Number(amount_paid);
    let discount_applied = 0;

    // EARLY REPAYMENT DISCOUNT LOGIC
    if (final_amount_paid >= remainingBalance) {
      const ratio = remainingBalance / loan.total_repayment;
      const remaining_interest = loan.interest_amount * ratio;
      
      discount_applied = remaining_interest * 0.10; // 10% discount
      final_amount_paid = remainingBalance - discount_applied; 
    }

    const paymentRatio = final_amount_paid / loan.total_repayment;
    const agent_share = (loan.interest_amount * 0.8) * paymentRatio;
    const system_share = (loan.interest_amount * 0.2) * paymentRatio;

    await connection.beginTransaction();
    try {
      await connection.execute(
        'INSERT INTO repayments (loan_id, amount_paid, agent_share, system_share) VALUES (?, ?, ?, ?)', 
        [loan.id, final_amount_paid, agent_share, system_share]
      );
      
      await connection.execute('UPDATE agents SET wallet_balance = wallet_balance + ? WHERE user_id = ?', [agent_share, agentUserId]);

      const newTotalPaid = Number(loan.already_paid) + final_amount_paid;
      if (newTotalPaid >= (Number(loan.total_repayment) - discount_applied)) {
        await connection.execute('UPDATE loans SET status = "fully_paid" WHERE id = ?', [loan.id]);
      }

      await connection.commit();
      await connection.end();
      res.status(201).json({ 
        message: 'Repayment recorded', 
        discount_applied,
        final_amount_paid
      });
    } catch (error: any) {
      await connection.rollback();
      throw error;
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 7. GET MY TRANSACTION HISTORY
router.get('/transactions', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [transactions]: any = await connection.execute(`
      SELECT 
        r.id as receipt_id, 
        r.amount_paid, 
        r.created_at,
        l.principal,
        l.interest_amount,
        l.total_repayment,
        ag_u.name as agent_name,
        (SELECT SUM(amount_paid) FROM repayments WHERE loan_id = l.id) as total_paid_on_loan
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN agents a ON t.registered_by_agent_id = a.id
      LEFT JOIN users ag_u ON a.user_id = ag_u.id
      WHERE t.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    
    await connection.end();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET MY PROFILE
router.get('/profile', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [traderRec]: any = await connection.execute('SELECT id FROM traders WHERE user_id = ?', [req.user.id]);
    if (traderRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Not found' }); }
    
    const traderId = traderRec[0].id;
    const [profile]: any = await connection.execute(`
      SELECT p.*, u.name, u.phone 
      FROM trader_profiles p
      JOIN traders t ON p.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE p.trader_id = ?
    `, [traderId]);
    
    await connection.end();
    if (profile.length === 0) {
      const [user]: any = await connection.execute('SELECT name, phone FROM users WHERE id = ?', [req.user.id]);
      return res.json({ name: user[0].name, phone: user[0].phone });
    }
    res.json(profile[0]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 9. UPDATE MY PROFILE
router.post('/profile', requireAuth(['trader']), async (req: any, res: any) => {
  const { business_name, business_type, emergency_contact_name, emergency_contact_phone } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [traderRec]: any = await connection.execute('SELECT id FROM traders WHERE user_id = ?', [req.user.id]);
    if (traderRec.length === 0) { await connection.end(); return res.status(404).json({ error: 'Not found' }); }
    
    const traderId = traderRec[0].id;
    
    await connection.execute(`
      INSERT INTO trader_profiles (trader_id, business_name, business_type, emergency_contact_name, emergency_contact_phone) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        business_name = VALUES(business_name), 
        business_type = VALUES(business_type), 
        emergency_contact_name = VALUES(emergency_contact_name), 
        emergency_contact_phone = VALUES(emergency_contact_phone)
    `, [traderId, business_name, business_type, emergency_contact_name, emergency_contact_phone]);
    
    await connection.end();
    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 10. GET LOAN AGREEMENT (For Digital Receipt)
router.get('/loan-agreement', requireAuth(['trader']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [loan]: any = await connection.execute(`
      SELECT 
        l.id as loan_id,
        l.principal,
        l.interest_amount,
        l.total_repayment,
        l.due_date,
        la.purpose,
        la.applied_at,
        u.name as trader_name,
        u.phone as trader_phone,
        ag_u.name as agent_name,
        m.name as market_name
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      JOIN users ag_u ON a.user_id = ag_u.id
      JOIN markets m ON t.market_id = m.id
      WHERE t.user_id = ?
      ORDER BY l.id DESC LIMIT 1
    `, [req.user.id]);
    
    await connection.end();
    if (loan.length === 0) return res.status(404).json({ error: 'No loan agreement found' });
    res.json(loan[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
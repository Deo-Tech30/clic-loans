import bcrypt from 'bcrypt';
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

// ==========================================
// 1. MARKETS
// ==========================================
router.post('/markets', requireAuth(['admin']), async (req: any, res: any) => {
  const { name, location } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result]: any = await connection.execute(
      'INSERT INTO markets (name, location) VALUES (?, ?)',
      [name, location]
    );
    await connection.end();
    res.status(201).json({ message: 'Market created successfully', marketId: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/markets', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [markets] = await connection.execute('SELECT * FROM markets');
    await connection.end();
    res.json(markets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/markets/:id', requireAuth(['admin']), async (req: any, res: any) => {
  const { name, location } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE markets SET name = ?, location = ? WHERE id = ?',
      [name, location, req.params.id]
    );
    await connection.end();
    res.json({ message: 'Market updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/markets/:id', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM markets WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ message: 'Market deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. AGENTS
// ==========================================
router.post('/agents', requireAuth(['admin']), async (req: any, res: any) => {
  const { name, phone, password, market_id } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [existing]: any = await connection.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [userResult]: any = await connection.execute(
      'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, phone, passwordHash, 'agent']
    );
    const userId = userResult.insertId;

    await connection.execute(
      'INSERT INTO agents (user_id, market_id) VALUES (?, ?)',
      [userId, market_id]
    );

    await connection.end();
    res.status(201).json({ message: 'Agent created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agents', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agents]: any = await connection.execute(`
      SELECT a.id, u.name, u.phone, m.name as market_name, m.id as market_id
      FROM agents a
      JOIN users u ON a.user_id = u.id
      JOIN markets m ON a.market_id = m.id
    `);
    await connection.end();
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/agents/:id', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [agentRec]: any = await connection.execute('SELECT user_id FROM agents WHERE id = ?', [req.params.id]);
    if (agentRec.length > 0) {
      await connection.execute('DELETE FROM agents WHERE id = ?', [req.params.id]);
      await connection.execute('DELETE FROM users WHERE id = ?', [agentRec[0].user_id]);
    }
    await connection.end();
    res.json({ message: 'Agent removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. STATS (For Overview)
// ==========================================
router.get('/stats', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [traders]: any = await connection.execute('SELECT COUNT(*) as count FROM traders');
    const [agents]: any = await connection.execute('SELECT COUNT(*) as count FROM agents');
    const [activeLoans]: any = await connection.execute("SELECT COUNT(*) as count, SUM(principal) as total_amount FROM loans WHERE status = 'active'");
    const [completedLoans]: any = await connection.execute("SELECT COUNT(*) as count FROM loans WHERE status = 'fully_paid'");
    const [pendingApps]: any = await connection.execute("SELECT COUNT(*) as count FROM loan_applications WHERE status = 'pending'");
    const [revenue]: any = await connection.execute('SELECT SUM(system_share) as total FROM repayments');
    const [payouts]: any = await connection.execute('SELECT SUM(agent_share) as total FROM repayments');
    
    const [recentApps]: any = await connection.execute(`
      SELECT u.name as trader_name, lo.amount, la.status, la.applied_at 
      FROM loan_applications la 
      JOIN traders t ON la.trader_id = t.id 
      JOIN users u ON t.user_id = u.id 
      JOIN loan_offers lo ON la.offer_id = lo.id
      ORDER BY la.applied_at DESC LIMIT 5
    `);

    await connection.end();
    res.json({
      totalTraders: traders[0].count,
      totalAgents: agents[0].count,
      activeLoans: activeLoans[0].count,
      activeLoanValue: activeLoans[0].total_amount || 0,
      completedLoans: completedLoans[0].count,
      pendingApps: pendingApps[0].count,
      totalRevenue: revenue[0].total || 0,
      totalAgentPayouts: payouts[0].total || 0,
      recentApps
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. AUDIT (All Users & All Loans)
// ==========================================
router.get('/users', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users]: any = await connection.execute(`
      SELECT u.id, u.name, u.phone, u.role, u.created_at,
             COALESCE(m.name, 'N/A') as market_name
      FROM users u
      LEFT JOIN traders t ON u.id = t.user_id
      LEFT JOIN agents a ON u.id = a.user_id
      LEFT JOIN markets m ON t.market_id = m.id OR a.market_id = m.id
      WHERE u.role IN ('trader', 'agent')
      ORDER BY u.created_at DESC
    `);
    await connection.end();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/loans', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [loans]: any = await connection.execute(`
      SELECT l.id, l.principal, l.total_repayment, l.status, l.due_date,
             trader_u.name as trader_name, agent_u.name as agent_name
      FROM loans l
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users trader_u ON t.user_id = trader_u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      JOIN users agent_u ON a.user_id = agent_u.id
      ORDER BY l.id DESC
    `);
    await connection.end();
    res.json(loans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. FINANCIAL LEDGER & REPORTS
// ==========================================
router.get('/repayments', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [repayments]: any = await connection.execute(`
      SELECT r.id, r.amount_paid, r.agent_share, r.system_share, r.created_at, u.name as trader_name, ag_u.name as agent_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      JOIN users ag_u ON a.user_id = ag_u.id
      ORDER BY r.created_at DESC
    `);
    await connection.end();
    res.json(repayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [activeLoans]: any = await connection.execute(`
      SELECT SUM(principal) as total_principal, SUM(interest_amount) as total_expected_interest
      FROM loans WHERE status = 'active'
    `);

    const [repayments]: any = await connection.execute(`
      SELECT SUM(amount_paid) as total_collected, SUM(agent_share) as total_agent_payout, SUM(system_share) as total_system_revenue
      FROM repayments
    `);

    const [users]: any = await connection.execute(`SELECT COUNT(id) as total_users FROM users`);
    const [markets]: any = await connection.execute(`SELECT COUNT(id) as total_markets FROM markets`);

    const [recentTransactions]: any = await connection.execute(`
      SELECT r.amount_paid, r.system_share, r.created_at, u.name as trader_name, ag_u.name as agent_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON t.registered_by_agent_id = a.id
      JOIN users ag_u ON a.user_id = ag_u.id
      ORDER BY r.created_at DESC LIMIT 10
    `);

    await connection.end();
    
    res.json({
      activeLoans: {
        principal: activeLoans[0].total_principal || 0,
        expectedInterest: activeLoans[0].total_expected_interest || 0
      },
      repayments: {
        totalCollected: repayments[0].total_collected || 0,
        agentPayout: repayments[0].total_agent_payout || 0,
        systemRevenue: repayments[0].total_system_revenue || 0
      },
      platform: {
        totalUsers: users[0].total_users,
        totalMarkets: markets[0].total_markets
      },
      recentTransactions
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. LOAN MANAGEMENT (Admin Actions)
// ==========================================
router.get('/all-applications', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [apps]: any = await connection.execute(`
      SELECT 
        la.id as app_id, la.status, la.applied_at, la.purpose,
        lo.amount, lo.interest_rate, lo.duration_days,
        (lo.amount + (lo.amount * (lo.interest_rate / 100))) as total_repayment,
        COALESCE((SELECT SUM(amount_paid) FROM repayments r JOIN loans l ON r.loan_id = l.id WHERE l.application_id = la.id), 0) as total_paid,
        u.name as trader_name, u.phone as trader_phone,
        ag_u.name as agent_name
      FROM loan_applications la
      JOIN loan_offers lo ON la.offer_id = lo.id
      JOIN traders t ON la.trader_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN agents a ON lo.agent_id = a.id
      JOIN users ag_u ON a.user_id = ag_u.id
      ORDER BY la.applied_at DESC
    `);
    await connection.end();
    res.json(apps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/applications/:id/status', requireAuth(['admin']), async (req: any, res: any) => {
  const { status } = req.body;
  const appId = req.params.id;

  try {
    const connection = await mysql.createConnection(dbConfig);

    if (status === 'approved') {
      const [appData]: any = await connection.execute(`
        SELECT la.id, lo.amount, lo.interest_rate, lo.duration_days 
        FROM loan_applications la
        JOIN loan_offers lo ON la.offer_id = lo.id
        WHERE la.id = ?
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
        
        const [existingLoan]: any = await connection.execute('SELECT id FROM loans WHERE application_id = ?', [appId]);
        if (existingLoan.length === 0) {
          await connection.execute(`
            INSERT INTO loans (application_id, principal, interest_amount, total_repayment, status, due_date)
            VALUES (?, ?, ?, ?, 'active', ?)
          `, [appId, principal, interest_amount, total_repayment, dueDateStr]);
        }
        
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } else if (status === 'rejected') {
      await connection.execute('UPDATE loan_applications SET status = "rejected" WHERE id = ?', [appId]);
    } else {
      await connection.execute('UPDATE loan_applications SET status = ? WHERE id = ?', [status, appId]);
    }

    await connection.end();
    res.json({ message: `Application ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 17. GET PLATFORM SETTINGS
router.get('/settings', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [settings]: any = await connection.execute('SELECT * FROM platform_settings WHERE id = 1');
    await connection.end();
    res.json(settings[0]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 18. UPDATE PLATFORM SETTINGS
router.put('/settings', requireAuth(['admin']), async (req: any, res: any) => {
  const { platform_fee_percentage, early_payment_discount, sms_sender_id } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE platform_settings SET platform_fee_percentage = ?, early_payment_discount = ?, sms_sender_id = ? WHERE id = 1',
      [platform_fee_percentage, early_payment_discount, sms_sender_id]
    );
    await connection.end();
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 19. GET AUDIT LOGS
router.get('/audit-logs', requireAuth(['admin']), async (req: any, res: any) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [logs]: any = await connection.execute(`
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    await connection.end();
    res.json(logs);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// 20. CREATE AUDIT LOG (Internal Endpoint)
router.post('/audit-log', requireAuth(['admin', 'agent', 'trader']), async (req: any, res: any) => {
  const { action, details } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO audit_logs (user_id, user_role, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, req.user.role, action, details]
    );
    await connection.end();
    res.json({ message: 'Logged' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
// 21. ADMIN MANUAL OVERRIDE (Force Close or Default a Loan)
router.put('/loans/:id/override', requireAuth(['admin']), async (req: any, res: any) => {
  const { status } = req.body; // 'fully_paid' or 'defaulted'
  const loanId = req.params.id;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. Update the loan status
    await connection.execute('UPDATE loans SET status = ? WHERE id = ?', [status, loanId]);

    // 2. Audit Log
    await connection.execute(
      'INSERT INTO audit_logs (user_id, user_role, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, req.user.role, 'ADMIN_OVERRIDE', `Admin manually set Loan #${loanId} to ${status}`]
    );

    await connection.end();
    res.json({ message: `Loan ${status === 'fully_paid' ? 'marked as PAID' : 'marked as DEFAULTED'}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
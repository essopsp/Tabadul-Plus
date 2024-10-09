const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Import authenticateToken middleware
const authenticateToken = require('./middleware/authenticateToken');

// Routes
const customersRouter = require('./routes/customers');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const exchangeRatesRouter = require('./routes/exchangeRates');
const reportsRouter = require('./routes/reports');
const employeesRouter = require('./routes/employees');
const customerBalancesRouter = require('./routes/customerBalances');

app.use('/api/customers', authenticateToken, customersRouter);
app.use('/api/accounts', authenticateToken, accountsRouter);
app.use('/api/transactions', authenticateToken, transactionsRouter);
app.use('/api/exchange-rates', authenticateToken, exchangeRatesRouter);
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/employees', authenticateToken, employeesRouter);
app.use('/api/customer-balances', authenticateToken, customerBalancesRouter);

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM employees WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    const employee = result.rows[0];
    if (password === employee.password) {
      const token = jwt.sign({ id: employee.id, username: employee.username, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await pool.query('INSERT INTO login_logs (employee_id) VALUES ($1)', [employee.id]);
      res.json({ 
        token, 
        user: { 
          id: employee.id, 
          username: employee.username, 
          name: employee.name,
          role: employee.role 
        } 
      });
    } else {
      res.status(400).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Logout route
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE login_logs SET logout_time = CURRENT_TIMESTAMP WHERE employee_id = $1 AND logout_time IS NULL', [req.user.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

app.get('/', (req, res) => {
  res.send('مرحبًا بك في نظام Tabadul Plus');
});

// Start server
app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port}`);
});
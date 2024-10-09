const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken'); // Assume this middleware exists

// إجراء معاملة جديدة
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('بيانات المعاملة الواردة:', req.body);
    await client.query('BEGIN');
    const { customer_id, type, currency, amount, paid_amount, rate, is_completed, remaining_amount, description, created_by } = req.body;
    
    // التحقق من وجود حساب للعميل
    let accountResult = await client.query('SELECT id FROM accounts WHERE customer_id = $1', [customer_id]);
    console.log('نتيجة استعلام الحساب:', accountResult.rows);
    
    let account_id;
    // إذا لم يكن للعميل حساب، قم بإنشاء واحد
    if (accountResult.rows.length === 0) {
      console.log('إنشاء حساب جديد للعميل:', customer_id);
      const newAccountResult = await client.query(
        'INSERT INTO accounts (customer_id, balance_usd, balance_lyd) VALUES ($1, 0, 0) RETURNING id',
        [customer_id]
      );
      account_id = newAccountResult.rows[0].id;
    } else {
      account_id = accountResult.rows[0].id;
    }

    // إدخال المعاملة
    const insertQuery = `
      INSERT INTO transactions 
      (account_id, type, currency, amount, paid_amount, rate, is_completed, remaining_amount, description, created_at, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10) 
      RETURNING *
    `;
    const insertValues = [account_id, type, currency, amount, paid_amount, rate, is_completed, remaining_amount, description, created_by];
    console.log('استعلام إدخال المعاملة:', insertQuery);
    console.log('قيم إدخال المعاملة:', insertValues);
    
    const newTransaction = await client.query(insertQuery, insertValues);
    console.log('المعاملة الجديدة:', newTransaction.rows[0]);

    // تحديث رصيد الحساب فقط للإيداع والسحب أو المعاملات غير المكتملة
    if (type === 'deposit' || type === 'withdraw' || !is_completed) {
      let updateQuery;
      let updateValues;
      if (type === 'deposit') {
        updateQuery = 'UPDATE accounts SET balance_' + currency.toLowerCase() + ' = balance_' + currency.toLowerCase() + ' + $1 WHERE id = $2';
        updateValues = [amount, account_id];
      } else if (type === 'withdraw') {
        updateQuery = 'UPDATE accounts SET balance_' + currency.toLowerCase() + ' = balance_' + currency.toLowerCase() + ' - $1 WHERE id = $2';
        updateValues = [amount, account_id];
      } else if (!is_completed) {
        if (type === 'buy' && currency === 'USD') {
          updateQuery = 'UPDATE accounts SET balance_usd = balance_usd + $1 WHERE id = $2';
          updateValues = [remaining_amount, account_id];
        } else if (type === 'sell' && currency === 'USD') {
          updateQuery = 'UPDATE accounts SET balance_usd = balance_usd - $1 WHERE id = $2';
          updateValues = [remaining_amount, account_id];
        }
      }

      if (updateQuery) {
        console.log('استعلام تحديث الحساب:', updateQuery);
        console.log('قيم تحديث الحساب:', updateValues);
        await client.query(updateQuery, updateValues);
      }
    }

    // الحصول على اسم العميل
    const customerNameResult = await client.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
    const customer_name = customerNameResult.rows[0].name;

    await client.query('COMMIT');

    // إضافة customer_name إلى البيانات المرتجعة
    const transactionWithCustomerName = {
      ...newTransaction.rows[0],
      customer_name
    };

    res.json(transactionWithCustomerName);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('خطأ في إضافة المعاملة:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// الحصول على جميع المعاملات لحساب معين
router.get('/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await pool.query('SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC', [id]);
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// الحصول على تقرير المعاملات لفترة زمنية محددة
router.get('/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const report = await pool.query(`
      SELECT customers.name, SUM(transactions.amount) as total_amount, transactions.currency 
      FROM transactions 
      JOIN accounts ON transactions.account_id = accounts.id 
      JOIN customers ON accounts.customer_id = customers.id 
      WHERE transactions.created_at BETWEEN $1 AND $2
      GROUP BY customers.name, transactions.currency
    `, [start_date, end_date]);
    res.json(report.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// إضافة هذا المسار الجديد
router.get('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await pool.query(
      'SELECT t.* FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.customer_id = $1 ORDER BY t.created_at DESC',
      [id]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// إضافة هذا المسار الجديد في ملف routes/transactions.js
router.get('/latest', async (req, res) => {
  try {
    const latestTransactions = await pool.query(
      'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10'
    );
    res.json(latestTransactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// Get transactions with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT t.*, c.name as customer_name, 
             (SELECT SUM(CASE 
                WHEN type IN ('deposit', 'sell') THEN amount 
                WHEN type IN ('withdraw', 'buy') THEN -amount 
                ELSE 0 
              END) 
              FROM transactions 
              WHERE account_id = t.account_id AND created_at <= t.created_at
             ) as balance
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `SELECT COUNT(*) FROM transactions`;

    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      transactions: result.rows,
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// Search transactions
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const query = `
      SELECT t.*, c.name as customer_name, 
             (SELECT SUM(CASE 
                WHEN type IN ('deposit', 'sell') THEN amount 
                WHEN type IN ('withdraw', 'buy') THEN -amount 
                ELSE 0 
              END) 
              FROM transactions 
              WHERE account_id = t.account_id AND created_at <= t.created_at
             ) as balance
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      WHERE 
        t.id::text LIKE $1 OR
        c.name ILIKE $1 OR
        c.phone LIKE $1 OR
        t.created_by ILIKE $1
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

module.exports = router;
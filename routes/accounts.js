const express = require('express');
const router = express.Router();
const pool = require('../db');

// إنشاء حساب جديد
router.post('/', async (req, res) => {
  try {
    const { customer_id } = req.body;
    const newAccount = await pool.query(
      'INSERT INTO accounts (customer_id) VALUES ($1) RETURNING *',
      [customer_id]
    );
    res.json(newAccount.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// الحصول على حساب بواسطة معرف العميل
router.get('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await pool.query('SELECT * FROM accounts WHERE customer_id = $1', [id]);
    res.json(account.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// الحصول على جميع الحسابات
router.get('/', async (req, res) => {
  console.log('Received request for accounts');
  try {
    const allAccounts = await pool.query('SELECT * FROM accounts');
    console.log('Accounts fetched:', allAccounts.rows);
    res.json(allAccounts.rows);
  } catch (err) {
    console.error('Error fetching accounts:', err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

module.exports = router;
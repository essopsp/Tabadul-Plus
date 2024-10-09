const express = require('express');
const router = express.Router();
const pool = require('../db');

// إنشاء عميل جديد
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, phone } = req.body;
    const newCustomer = await client.query(
      'INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *',
      [name, phone]
    );
    
    // إنشاء حساب تلقائيًا للعميل الجديد
    await client.query(
      'INSERT INTO accounts (customer_id) VALUES ($1)',
      [newCustomer.rows[0].id]
    );

    await client.query('COMMIT');
    res.json(newCustomer.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  } finally {
    client.release();
  }
});

// الحصول على جميع العملاء
router.get('/', async (req, res) => {
  try {
    const allCustomers = await pool.query('SELECT * FROM customers');
    res.json(allCustomers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// إضافة هذا المسار الجديد
router.get('/:id', async (req, res) => {
  console.log(`Received request for customer with id: ${req.params.id}`);
  try {
    const { id } = req.params;
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (customer.rows.length === 0) {
      return res.status(404).json({ message: 'العميل غير موجود' });
    }
    
    res.json(customer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

module.exports = router;
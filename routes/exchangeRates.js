const express = require('express');
const router = express.Router();
const pool = require('../db');

// إضافة سعر صرف جديد
router.post('/', async (req, res) => {
  try {
    const { rate_usd_to_lyd, rate_lyd_to_usd } = req.body;
    const newRate = await pool.query(
      'INSERT INTO exchange_rates (rate_usd_to_lyd, rate_lyd_to_usd) VALUES ($1, $2) RETURNING *',
      [rate_usd_to_lyd, rate_lyd_to_usd]
    );
    res.json(newRate.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

// الحصول على أحدث سعر صرف
router.get('/latest', async (req, res) => {
  try {
    const latestRate = await pool.query('SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT 1');
    res.json(latestRate.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

module.exports = router;
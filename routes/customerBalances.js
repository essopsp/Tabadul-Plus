const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const balances = await pool.query(`
      SELECT 
        currency,
        SUM(CASE 
          WHEN type = 'deposit' THEN amount 
          WHEN type = 'withdraw' THEN -amount
          ELSE 0 
        END) as total,
        SUM(CASE 
          WHEN type = 'deposit' THEN amount 
          ELSE 0 
        END) as credit,
        SUM(CASE 
          WHEN type = 'withdraw' THEN amount 
          ELSE 0 
        END) as debit
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.customer_id = $1
      GROUP BY currency
    `, [id]);
    
    const balanceObject = {};
    balances.rows.forEach(row => {
      balanceObject[row.currency] = {
        total: parseFloat(row.total) || 0,
        credit: parseFloat(row.credit) || 0,
        debit: parseFloat(row.debit) || 0
      };
    });
    
    res.json(balanceObject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('خطأ في الخادم');
  }
});

module.exports = router;
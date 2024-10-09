const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { type, startDate, endDate } = req.query;
  console.log('Received report request:', { type, startDate, endDate });

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log('Parsed dates:', { start, end });

    let query;
    switch (type) {
      case 'daily':
        query = `
          SELECT DATE(created_at) as date, 
                 SUM(CASE WHEN type IN ('sell', 'deposit') THEN amount ELSE 0 END) as total_income,
                 SUM(CASE WHEN type IN ('buy', 'withdraw') THEN amount ELSE 0 END) as total_expense,
                 COUNT(*) as transaction_count,
                 STRING_AGG(DISTINCT created_by, ', ') as employees
          FROM transactions
          WHERE created_at >= $1 AND created_at <= $2
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        break;
      case 'revenue':
        query = `
          SELECT DATE(created_at) as date, 
                 SUM(CASE WHEN type = 'sell' THEN amount ELSE 0 END) as sales_revenue,
                 SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposit_revenue,
                 SUM(amount) as total_revenue,
                 STRING_AGG(DISTINCT created_by, ', ') as employees
          FROM transactions
          WHERE type IN ('sell', 'deposit') AND created_at BETWEEN $1 AND $2
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        break;
      case 'sales':
        query = `
          SELECT DATE(created_at) as date, 
                 SUM(amount) as total_sales,
                 COUNT(*) as sale_count,
                 AVG(amount) as average_sale,
                 STRING_AGG(DISTINCT created_by, ', ') as employees
          FROM transactions
          WHERE type = 'sell' AND created_at BETWEEN $1 AND $2
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        break;
      case 'purchases':
        query = `
          SELECT DATE(created_at) as date, 
                 SUM(amount) as total_purchases,
                 COUNT(*) as purchase_count,
                 AVG(amount) as average_purchase,
                 STRING_AGG(DISTINCT created_by, ', ') as employees
          FROM transactions
          WHERE type = 'buy' AND created_at BETWEEN $1 AND $2
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        break;
      case 'customers':
        query = `
          SELECT 
            c.id as customer_id,
            c.name as customer_name,
            c.phone as customer_phone,
            t.id as transaction_id,
            t.type as transaction_type,
            t.currency,
            t.amount,
            t.rate,
            t.created_at as transaction_date,
            t.description,
            t.created_by
          FROM customers c
          LEFT JOIN accounts a ON c.id = a.customer_id
          LEFT JOIN transactions t ON a.id = t.account_id AND t.created_at BETWEEN $1 AND $2
          ORDER BY c.name, t.created_at
        `;
        break;
      case 'customer_transactions':
        query = `
          SELECT 
            c.id as customer_id,
            c.name as customer_name,
            c.phone as customer_phone,
            t.id as transaction_id,
            t.type as transaction_type,
            t.currency,
            t.amount,
            t.paid_amount,
            t.rate,
            t.created_at as transaction_date,
            t.description,
            t.created_by,
            t.is_completed,
            t.remaining_amount
          FROM customers c
          JOIN accounts a ON c.id = a.customer_id
          JOIN transactions t ON a.id = t.account_id
          WHERE t.created_at BETWEEN $1 AND $2
          ORDER BY c.name, t.created_at
        `;
        break;
      default:
        return res.status(400).json({ error: 'نوع التقرير غير صالح' });
    }

    console.log('Executing query:', query);
    console.log('Query parameters:', [start, end]);
    
    const result = await pool.query(query, [start, end]);
    
    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No data found for the specified period');
      return res.json({ message: 'لا توجد بيانات للفترة المحددة', data: [] });
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error in reports route:', err);
    res.status(500).json({ error: 'خطأ في الخادم', details: err.message });
  }
});

module.exports = router;
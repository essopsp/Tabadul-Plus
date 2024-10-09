const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, name, role FROM employees');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    const result = await pool.query(
      'INSERT INTO employees (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
      [username, password, name, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const result = await pool.query(
      'UPDATE employees SET name = $1, role = $2 WHERE id = $3 RETURNING id, username, name, role',
      [name, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'الموظف غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    // Check if the employee exists
    const checkResult = await client.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'الموظف غير موجود' });
    }

    // Check if there are any related records
    const transactionsResult = await client.query('SELECT COUNT(*) FROM transactions WHERE created_by = $1', [id]);
    if (parseInt(transactionsResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'لا يمكن حذف الموظف لوجود معاملات مرتبطة به' });
    }

    // Delete related records in login_logs table
    await client.query('DELETE FROM login_logs WHERE employee_id = $1', [id]);

    // If all checks pass, delete the employee
    const deleteResult = await client.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    
    await client.query('COMMIT');
    res.sendStatus(204);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in delete employee:', err);
    res.status(500).json({ error: 'خطأ في الخادم: ' + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
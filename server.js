const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const customerBalancesRouter = require('./routes/customerBalances');
app.use('/api/customer-balances', customerBalancesRouter);
const customersRouter = require('./routes/customers');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const exchangeRatesRouter = require('./routes/exchangeRates');

app.use('/api/customers', customersRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/exchange-rates', exchangeRatesRouter);

app.get('/', (req, res) => {
  res.send('مرحبًا بك في نظام TEBADEL PLUS');
});

// Start server
app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port}`);
});
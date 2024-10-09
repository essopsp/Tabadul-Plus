import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionForm() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [type, setType] = useState('sell');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/accounts');
        setAccounts(response.data);
      } catch (error) {
        console.error('خطأ في جلب بيانات الحسابات:', error);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/transactions', {
        account_id: selectedAccount,
        type,
        currency,
        amount: parseFloat(amount)
      });
      alert('تمت إضافة المعاملة بنجاح');
      setSelectedAccount('');
      setType('sell');
      setCurrency('USD');
      setAmount('');
    } catch (error) {
      console.error('خطأ في إضافة المعاملة:', error);
      alert('حدث خطأ أثناء إضافة المعاملة');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>إجراء معاملة جديدة</h2>
      <div>
        <label htmlFor="account">الحساب:</label>
        <select
          id="account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          required
        >
          <option value="">اختر الحساب</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {`حساب رقم ${account.id} - رصيد الدولار: ${account.balance_usd}, رصيد الدينار: ${account.balance_lyd}`}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="type">نوع المعاملة:</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="sell">بيع</option>
          <option value="buy">شراء</option>
        </select>
      </div>
      <div>
        <label htmlFor="currency">العملة:</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        >
          <option value="USD">دولار أمريكي</option>
          <option value="LYD">دينار ليبي</option>
        </select>
      </div>
      <div>
        <label htmlFor="amount">المبلغ:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <button type="submit">إجراء المعاملة</button>
    </form>
  );
}

export default TransactionForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function AccountDetails() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const accountResponse = await axios.get(`http://localhost:3000/api/accounts/customer/${id}`);
        setAccount(accountResponse.data[0]);

        const transactionsResponse = await axios.get(`http://localhost:3000/api/transactions/account/${accountResponse.data[0].id}`);
        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error('خطأ في جلب تفاصيل الحساب:', error);
      }
    };

    fetchAccountDetails();
  }, [id]);

  if (!account) {
    return <div>جاري تحميل تفاصيل الحساب...</div>;
  }

  return (
    <div>
      <h2>تفاصيل الحساب</h2>
      <p>رقم الحساب: {account.id}</p>
      <p>رصيد الدولار: {account.balance_usd}</p>
      <p>رصيد الدينار الليبي: {account.balance_lyd}</p>

      <h3>المعاملات الأخيرة</h3>
      <table>
        <thead>
          <tr>
            <th>النوع</th>
            <th>العملة</th>
            <th>المبلغ</th>
            <th>السعر</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.type === 'buy' ? 'شراء' : 'بيع'}</td>
              <td>{transaction.currency}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.rate}</td>
              <td>{new Date(transaction.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountDetails;
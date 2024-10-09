import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerBalances = () => {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/customer-balances`);
        setBalances(response.data);
      } catch (error) {
        console.error('خطأ في جلب أرصدة العملاء:', error);
      }
    };

    fetchBalances();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">أرصدة العملاء</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الرصيد بالدولار</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الرصيد بالدينار</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {balances.map((balance) => (
            <tr key={balance.customer_id}>
              <td className="px-6 py-4 whitespace-nowrap">{balance.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{balance.balance_usd}</td>
              <td className="px-6 py-4 whitespace-nowrap">{balance.balance_lyd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerBalances;
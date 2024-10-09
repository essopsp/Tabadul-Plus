import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Add this import
import { useParams } from 'react-router-dom';
import PrintView from './PrintView';
import api from '../utils/api';

const AccountDetails = () => {
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerResponse = await api.get(`/api/customers/${id}`);
        setCustomer(customerResponse.data);

        const transactionsResponse = await api.get(`/api/transactions/customer/${id}`);
        setTransactions(transactionsResponse.data);

        const balancesResponse = await api.get(`/api/customer-balances/${id}`);
        setBalances(balancesResponse.data);
      } catch (error) {
        console.error('خطأ في جلب بيانات العميل:', error);
      }
    };

    fetchData();
  }, [id]);

  const calculateTotals = () => {
    const totals = {};
    transactions.forEach(transaction => {
      if (!totals[transaction.currency]) {
        totals[transaction.currency] = { totalCredit: 0, totalDebit: 0, total: 0 };
      }
      if (transaction.type === 'deposit') {
        totals[transaction.currency].totalCredit += parseFloat(transaction.amount);
        totals[transaction.currency].total += parseFloat(transaction.amount);
      } else if (transaction.type === 'withdraw') {
        totals[transaction.currency].totalDebit += parseFloat(transaction.amount);
        totals[transaction.currency].total -= parseFloat(transaction.amount);
      }
    });
    return totals;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div id="print-root"></div>');
    printWindow.document.write('</body></html>');
    
    ReactDOM.render(
      <PrintView 
        data={{ customer, balances, transactions }} 
        type="account"
      />,
      printWindow.document.getElementById('print-root')
    );
    
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  };

  if (!customer) {
    return <div>جاري تحميل بيانات العميل...</div>;
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">حركات العميل</h1>
        <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          طباعة
        </button>
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p><strong>اسم العميل:</strong> {customer.name}</p>
        <p><strong>رقم العميل:</strong> {customer.id}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">أرصدة العميل</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-right">العملة</th>
              <th className="py-2 px-4 border-b text-right">الرصيد</th>
              <th className="py-2 px-4 border-b text-right">الدائن</th>
              <th className="py-2 px-4 border-b text-right">المدين</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(balances).map(([currency, balance]) => (
              <tr key={currency}>
                <td className="py-2 px-4 border-b text-right">{currency}</td>
                <td className="py-2 px-4 border-b text-right">{balance.total.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-right">{balance.credit.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-right">{balance.debit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold my-4">حركات العميل</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-right">الرقم المرجعي</th>
              <th className="py-2 px-4 border-b text-right">التاريخ</th>
              <th className="py-2 px-4 border-b text-right">البيان</th>
              <th className="py-2 px-4 border-b text-right">نوع المعاملة</th>
              <th className="py-2 px-4 border-b text-right">العملة</th>
              <th className="py-2 px-4 border-b text-right">الدائن</th>
              <th className="py-2 px-4 border-b text-right">المدين</th>
              <th className="py-2 px-4 border-b text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-2 px-4 border-b text-right">{transaction.id}</td>
                <td className="py-2 px-4 border-b text-right">{new Date(transaction.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b text-right">{transaction.description}</td>
                <td className="py-2 px-4 border-b text-right">{transaction.type}</td>
                <td className="py-2 px-4 border-b text-right">{transaction.currency}</td>
                <td className="py-2 px-4 border-b text-right">
                  {transaction.type === 'deposit' ? transaction.amount : '0'}
                </td>
                <td className="py-2 px-4 border-b text-right">
                  {transaction.type === 'withdraw' ? transaction.amount : '0'}
                </td>
                <td className="py-2 px-4 border-b text-right">
                  {transaction.is_completed ? 'مكتملة' : 'غر مكتملة'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold my-4">إجمالي الحركات</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-right">العملة</th>
              <th className="py-2 px-4 border-b text-right">إجمالي الدائن</th>
              <th className="py-2 px-4 border-b text-right">إجمالي المدين</th>
              <th className="py-2 px-4 border-b text-right">الرصيد النهائي</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(totals).map(([currency, total]) => (
              <tr key={currency}>
                <td className="py-2 px-4 border-b text-right">{currency}</td>
                <td className="py-2 px-4 border-b text-right">{total.totalCredit.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-right">{total.totalDebit.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-right">{total.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountDetails;
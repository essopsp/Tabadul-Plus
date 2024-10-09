import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TransactionForm from './TransactionForm';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page) => {
    try {
      const response = await api.get('/api/transactions', {
        params: { page, limit: 10 }
      });
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await api.get('/api/transactions/search', {
        params: { searchTerm }
      });
      setTransactions(response.data);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error('Error searching transactions:', error);
    }
  };

  const translateTransactionType = (type) => {
    const translations = {
      'sell': 'بيع',
      'buy': 'شراء',
      'deposit': 'إيداع',
      'withdraw': 'سحب'
    };
    return translations[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">المعاملات</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث (رقم المعاملة، اسم العميل، رقم الهاتف، اسم الموظف)"
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded mt-2 w-full"
        >
          بحث
        </button>
      </div>

      <TransactionForm onTransactionAdded={() => fetchTransactions(1)} />

      <div className="overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="border p-2">الرقم المرجعي</th>
              <th className="border p-2">نوع المعاملة</th>
              <th className="border p-2">اسم العميل</th>
              <th className="border p-2">المبلغ</th>
              <th className="border p-2">العملة</th>
              <th className="border p-2">الدائن</th>
              <th className="border p-2">المدين</th>
              <th className="border p-2">الرصيد</th>
              <th className="border p-2">البيان</th>
              <th className="border p-2">التاريخ</th>
              <th className="border p-2">تم الإنشاء بواسطة</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="border p-2">{transaction.id}</td>
                <td className="border p-2">{translateTransactionType(transaction.type)}</td>
                <td className="border p-2">{transaction.customer_name}</td>
                <td className="border p-2">{transaction.amount}</td>
                <td className="border p-2">{transaction.currency}</td>
                <td className="border p-2">
                  {transaction.type === 'deposit' || transaction.type === 'sell' ? transaction.amount : '-'}
                </td>
                <td className="border p-2">
                  {transaction.type === 'withdraw' || transaction.type === 'buy' ? transaction.amount : '-'}
                </td>
                <td className="border p-2">{transaction.balance}</td>
                <td className="border p-2">{transaction.description}</td>
                <td className="border p-2">{new Date(transaction.created_at).toLocaleString()}</td>
                <td className="border p-2">{transaction.created_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`mx-1 px-3 py-1 border rounded ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
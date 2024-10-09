import React from 'react';
import companyConfig from '../companyConfig';

const PrintView = ({ data, type }) => {
  const CompanyHeader = () => (
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">{companyConfig.name}</h1>
      <p>{companyConfig.phone} | {companyConfig.email}</p>
      <p>{companyConfig.address}</p>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (type === 'account') {
    return (
      <div className="p-8">
        <CompanyHeader />
        <h2 className="text-2xl font-bold mb-4">تفاصيل حساب العميل</h2>
        <p><strong>اسم العميل:</strong> {data.customer.name}</p>
        <p><strong>رقم العميل:</strong> {data.customer.id}</p>
        
        <h3 className="text-xl font-bold my-4">أرصدة العميل</h3>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">العملة</th>
              <th className="border border-gray-300 p-2">الرصيد</th>
              <th className="border border-gray-300 p-2">الدائن</th>
              <th className="border border-gray-300 p-2">المدين</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.balances).map(([currency, balance]) => (
              <tr key={currency}>
                <td className="border border-gray-300 p-2">{currency}</td>
                <td className="border border-gray-300 p-2">{balance.total.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{balance.credit.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{balance.debit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-bold my-4">حركات العميل</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">الرقم المرجعي</th>
              <th className="border border-gray-300 p-2">التاريخ</th>
              <th className="border border-gray-300 p-2">البيان</th>
              <th className="border border-gray-300 p-2">نوع المعاملة</th>
              <th className="border border-gray-300 p-2">العملة</th>
              <th className="border border-gray-300 p-2">الدائن</th>
              <th className="border border-gray-300 p-2">المدين</th>
              <th className="border border-gray-300 p-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="border border-gray-300 p-2">{transaction.id}</td>
                <td className="border border-gray-300 p-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{transaction.description}</td>
                <td className="border border-gray-300 p-2">{transaction.type}</td>
                <td className="border border-gray-300 p-2">{transaction.currency}</td>
                <td className="border border-gray-300 p-2">
                  {transaction.type === 'deposit' ? transaction.amount : '0'}
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.type === 'withdraw' ? transaction.amount : '0'}
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.is_completed ? 'مكتملة' : 'غير مكتملة'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (type === 'transaction') {
    return (
      <div className="p-8">
        <CompanyHeader />
        <h2 className="text-2xl font-bold mb-4 text-center">إيصال المعاملة</h2>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <tbody>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">رقم المعاملة</th>
              <td className="border border-gray-300 p-2">{data.id}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">اسم العميل</th>
              <td className="border border-gray-300 p-2">{data.customer_name}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">نوع المعاملة</th>
              <td className="border border-gray-300 p-2">{translateTransactionType(data.type)}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">المبلغ</th>
              <td className="border border-gray-300 p-2">{data.amount} {data.currency}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">سعر الصرف</th>
              <td className="border border-gray-300 p-2">{data.rate}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">التاريخ</th>
              <td className="border border-gray-300 p-2">{formatDate(data.created_at)}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">الوصف</th>
              <td className="border border-gray-300 p-2">{data.description}</td>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 text-right">تم الإنشاء بواسطة</th>
              <td className="border border-gray-300 p-2">{data.created_by}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-8 text-center">
          <p>شكراً لتعاملكم معنا</p>
          <p className="text-sm mt-2">هذا الإيصال صالح كإثبات للمعاملة</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PrintView;
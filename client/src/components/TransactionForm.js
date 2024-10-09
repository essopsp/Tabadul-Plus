import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import api from '../utils/api';
import Modal from 'react-modal';
import PrintView from './PrintView';

Modal.setAppElement('#root');

const TransactionForm = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [type, setType] = useState('sell');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);
  const [description, setDescription] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [manualTotalAmount, setManualTotalAmount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersResponse = await api.get('/api/customers');
        setCustomers(customersResponse.data);

        const ratesResponse = await api.get('/api/exchange-rates/latest');
        setExchangeRate(ratesResponse.data.rate_usd_to_lyd);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!manualTotalAmount) {
      if (type === 'buy' && currency === 'USD') {
        setTotalAmount((parseFloat(amount) * parseFloat(exchangeRate)).toFixed(2));
      } else if (type === 'sell' && currency === 'USD') {
        setTotalAmount((parseFloat(amount) / parseFloat(exchangeRate)).toFixed(2));
      } else {
        setTotalAmount(amount);
      }
    }
  }, [type, currency, amount, exchangeRate, manualTotalAmount]);

  useEffect(() => {
    const generatedDescription = generateDescription();
    setDescription(generatedDescription);
  }, [selectedCustomer, type, currency, amount, exchangeRate]);

  const generateDescription = () => {
    const customerName = customers.find(c => c.id === parseInt(selectedCustomer))?.name || '';
    const typeText = {
      'sell': 'بيع',
      'buy': 'شراء',
      'deposit': 'إيداع',
      'withdraw': 'سحب'
    }[type];
    const currencyText = currency === 'USD' ? 'دولار' : 'دينار';
    const otherCurrency = currency === 'USD' ? 'دينار' : 'دولار';
    const totalAmount = (parseFloat(amount) * parseFloat(exchangeRate)).toFixed(2);

    if (type === 'deposit' || type === 'withdraw') {
      return `${typeText} ${amount} ${currencyText} في حساب العميل ${customerName}`;
    } else {
      return `${typeText} ${amount} ${currencyText} مقابل ${totalAmount} ${otherCurrency} للعميل ${customerName}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const selectedCustomerName = customers.find(c => c.id === parseInt(selectedCustomer))?.name || '';
      const transactionData = {
        customer_id: selectedCustomer,
        customer_name: selectedCustomerName, // إضافة اسم العميل
        type,
        currency,
        amount: parseFloat(amount),
        paid_amount: parseFloat(totalAmount),
        rate: parseFloat(exchangeRate),
        is_completed: isCompleted,
        remaining_amount: 0,
        description,
        created_by: user ? user.name : 'Unknown'
      };

      const response = await api.post('/api/transactions', transactionData);
      setLastTransaction(response.data);
      setModalIsOpen(false);
      setShowReceiptModal(true);
      resetForm();
    } catch (error) {
      console.error('خطأ في إضافة المعاملة:', error);
      alert('حدث خطأ أثناء إضافة المعاملة');
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setType('sell');
    setCurrency('USD');
    setAmount('');
    setPaidAmount('');
    setIsCompleted(true);
    setDescription('');
  };

  const isDepositOrWithdraw = type === 'deposit' || type === 'withdraw';

  const handleAddNewCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/customers', {
        name: newCustomerName,
        phone: newCustomerPhone
      });
      const newCustomer = response.data;
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer.id);
      setShowNewCustomerForm(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (error) {
      console.error('خطأ في إضافة العميل الجديد:', error);
      alert('حدث خطأ أثناء إضافة العميل الجديد');
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>إيصال المعاملة</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div id="print-root"></div>');
    printWindow.document.write('</body></html>');
    
    ReactDOM.render(
      <PrintView 
        data={lastTransaction} 
        type="transaction"
      />,
      printWindow.document.getElementById('print-root')
    );
    
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
  };

  const handleTotalAmountChange = (e) => {
    setTotalAmount(e.target.value);
    setManualTotalAmount(true);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setManualTotalAmount(false);
  };

  const handleExchangeRateChange = (e) => {
    setExchangeRate(e.target.value);
    setManualTotalAmount(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">إجراء معاملة جديدة</h1>
      <button 
        onClick={() => setModalIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        إضافة معاملة جديدة
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="نموذج المعاملة الجديدة"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-content p-6">
          <h2 className="text-2xl font-bold mb-6">إضافة معاملة جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* قسم معلومات العميل */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">معلومات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">اختر العميل:</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">اختر العميل</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm(true)}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-6"
                  >
                    إضافة عميل جديد
                  </button>
                </div>
              </div>
            </div>

            {/* نموذج إضافة عميل جديد */}
            {showNewCustomerForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">إضافة عميل جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">اسم العميل:</label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">رقم الهاتف:</label>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCustomer}
                  className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  إضافة العميل
                </button>
              </div>
            )}

            {/* قسم تفاصيل المعاملة */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">تفاصيل المعاملة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">نوع المعاملة:</label>
                  <select 
                    value={type} 
                    onChange={(e) => {
                      setType(e.target.value);
                      if (e.target.value === 'deposit' || e.target.value === 'withdraw') {
                        setAmount('');
                        setIsCompleted(true);
                      }
                    }} 
                    required 
                    className="w-full p-2 border rounded"
                  >
                    <option value="sell">بيع</option>
                    <option value="buy">شراء</option>
                    <option value="deposit">إيداع</option>
                    <option value="withdraw">سحب</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">العملة:</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    required 
                    className="w-full p-2 border rounded"
                  >
                    <option value="USD">دولار أمريكي</option>
                    <option value="LYD">دينار ليبي</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">المبلغ بالعملة المختارة:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">سعر الصرف:</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={handleExchangeRateChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block mb-1">المبلغ الكلي بالعملة الأخرى (اختياري):</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={handleTotalAmountChange}
                  className="w-full p-2 border rounded"
                  placeholder="اترك فارغاً للحساب التلقائي"
                />
              </div>
            </div>

            {/* قسم حالة المعاملة والبيان */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">معلومات إضافية</h3>
              {!isDepositOrWithdraw && (
                <div className="mb-3">
                  <label className="block mb-1">حالة المعاملة:</label>
                  <select 
                    value={isCompleted ? 'completed' : 'incomplete'} 
                    onChange={(e) => setIsCompleted(e.target.value === 'completed')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="completed">مكتملة</option>
                    <option value="incomplete">غير مكتملة</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block mb-1">البيان:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex justify-end space-x-2">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                إجراء المعاملة
              </button>
              <button 
                type="button" 
                onClick={() => setModalIsOpen(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal لعرض الإيصال */}
      <Modal
        isOpen={showReceiptModal}
        onRequestClose={() => setShowReceiptModal(false)}
        contentLabel="إيصال المعاملة"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl font-bold mb-4">إيصال المعاملة</h2>
        {lastTransaction && (
          <div className="space-y-2">
            <p><strong>رقم المعاملة:</strong> {lastTransaction.id}</p>
            <p><strong>اسم العميل:</strong> {lastTransaction.customer_name}</p>
            <p><strong>نوع المعاملة:</strong> {lastTransaction.type}</p>
            <p><strong>المبلغ:</strong> {lastTransaction.amount} {lastTransaction.currency}</p>
            <p><strong>سعر الصرف:</strong> {lastTransaction.rate}</p>
            <p><strong>التاريخ:</strong> {new Date(lastTransaction.created_at).toLocaleString()}</p>
            <p><strong>الوصف:</strong> {lastTransaction.description}</p>
            <p><strong>تم الإنشاء بواسطة:</strong> {lastTransaction.created_by}</p>
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={handlePrintReceipt}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            طباعة الإيصال
          </button>
          <button
            onClick={() => setShowReceiptModal(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            إغلاق
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionForm;
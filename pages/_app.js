import '../styles/globals.css'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import CustomerList from '../components/CustomerList';
import NewCustomerForm from '../components/NewCustomerForm';
import TransactionForm from '../components/TransactionForm';
import AccountDetails from '../components/AccountDetails';
import ExchangeRates from '../components/ExchangeRates';

function MyApp({ Component, pageProps }) {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div>
                  <Link to="/" className="flex items-center py-4 px-2">
                    <span className="font-semibold text-gray-500 text-lg">Tabadul Plus</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <Link to="/customers" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">قائمة العملاء</Link>
                  <Link to="/new-customer" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">إضافة عميل جديد</Link>
                  <Link to="/transaction" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">إجراء معاملة</Link>
                  <Link to="/exchange-rates" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">أسعار الصرف</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<h1 className="text-3xl font-bold text-gray-900">مرحبًا بك في نظام Tabadul Plus</h1>} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/new-customer" element={<NewCustomerForm />} />
            <Route path="/transaction" element={<TransactionForm />} />
            <Route path="/account/:id" element={<AccountDetails />} />
            <Route path="/exchange-rates" element={<ExchangeRates />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default MyApp
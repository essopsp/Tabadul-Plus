import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, Navigate } from 'react-router-dom';
import CustomerList from './components/CustomerList';
import Transactions from './components/Transactions';
import AccountDetails from './components/AccountDetails';
import Treasury from './components/Treasury';
import Login from './components/Login';
import EmployeeManagement from './components/EmployeeManagement';
import companyConfig from './companyConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      // This is a simplified example. In a real app, you'd want to verify the token with the server.
      setIsAuthenticated(true);
      setUser(JSON.parse(atob(token.split('.')[1])));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-lg animate-gradient">
          <div className="container mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div>
                  <Link to="/" className="flex items-center py-4 px-2">
                    <span className="font-semibold text-white text-lg hover:text-gray-300 transition duration-300">{companyConfig.name}</span>
                  </Link>
                </div>
                {isAuthenticated && (
                  <div className="hidden md:flex items-center space-x-1">
                    <Link to="/customers" className="py-4 px-2 text-gray-300 font-semibold hover:text-white transition duration-300">قائمة العملاء</Link>
                    <Link to="/transactions" className="py-4 px-2 text-gray-300 font-semibold hover:text-white transition duration-300">المعاملات</Link>
                    {isAdmin && (
                      <>
                        <Link to="/treasury" className="py-4 px-2 text-gray-300 font-semibold hover:text-white transition duration-300">الخزينة</Link>
                        <Link to="/employees" className="py-4 px-2 text-gray-300 font-semibold hover:text-white transition duration-300">إدارة الموظفين</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="py-4 px-2 text-gray-300 font-semibold hover:text-white transition duration-300">تسجيل الخروج</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
            <Route path="/" element={isAuthenticated ? (
              <div className="text-center">
                <img src={companyConfig.logo} alt={companyConfig.name} className="mx-auto mb-4 w-64" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{companyConfig.name}</h1>
                <p className="text-xl text-gray-600">نظام إدارة الصرافة</p>
                <div className="mt-4">
                  <p>{companyConfig.phone}</p>
                  <p>{companyConfig.email}</p>
                  <p>{companyConfig.address}</p>
                </div>
              </div>
            ) : <Navigate to="/login" />} />
            <Route path="/customers" element={isAuthenticated ? <CustomerList /> : <Navigate to="/login" />} />
            <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
            <Route path="/account/:id" element={isAuthenticated ? <AccountDetails /> : <Navigate to="/login" />} />
            <Route path="/treasury" element={isAuthenticated && isAdmin ? <Treasury /> : <Navigate to="/" />} />
            <Route path="/employees" element={isAuthenticated && isAdmin ? <EmployeeManagement /> : <Navigate to="/" />} />
          </Routes>
        </div>

        <footer className="bg-gray-800 text-white py-4 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p>Tabadul Plus System Created by Shlimbo Co for programming</p>
            <p>Phone: 00218926253733</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
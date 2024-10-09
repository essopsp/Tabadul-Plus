import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ username: '', password: '', name: '', role: 'user' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      setError('حدث خطأ أثناء جلب بيانات الموظفين: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleInputChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/employees', newEmployee);
      setNewEmployee({ username: '', password: '', name: '', role: 'user' });
      fetchEmployees();
    } catch (error) {
      setError('حدث خطأ أثناء إضافة الموظف: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      setError('حدث خطأ أثناء حذف الموظف: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">إدارة الموظفين</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-bold mb-2">إضافة موظف جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="username"
            placeholder="اسم المستخدم"
            value={newEmployee.username}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={newEmployee.password}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="name"
            placeholder="الاسم"
            value={newEmployee.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <select
            name="role"
            value={newEmployee.role}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="user">مستخدم</option>
            <option value="admin">مدير</option>
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          إضافة موظف
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-xl font-bold mb-2">قائمة الموظفين</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">اسم المستخدم</th>
            <th className="border border-gray-300 p-2">الاسم</th>
            <th className="border border-gray-300 p-2">الدور</th>
            <th className="border border-gray-300 p-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border border-gray-300 p-2">{employee.username}</td>
              <td className="border border-gray-300 p-2">{employee.name}</td>
              <td className="border border-gray-300 p-2">{employee.role}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeManagement;
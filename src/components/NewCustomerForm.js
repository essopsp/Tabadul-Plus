import React, { useState } from 'react';
import axios from 'axios';

function NewCustomerForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/customers', { name, phone, email });
      alert('تمت إضافة العميل بنجاح');
      setName('');
      setPhone('');
      setEmail('');
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
      alert('حدث خطأ أثناء إضافة العميل');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>إضافة عميل جديد</h2>
      <div>
        <label htmlFor="name">الاسم:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="phone">رقم الهاتف:</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">البريد الإلكتروني:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit">إضافة العميل</button>
    </form>
  );
}

export default NewCustomerForm;
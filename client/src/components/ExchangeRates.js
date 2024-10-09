import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ExchangeRates = () => {
  const [rates, setRates] = useState(null);
  const [newUsdToLyd, setNewUsdToLyd] = useState('');
  const [newLydToUsd, setNewLydToUsd] = useState('');

  useEffect(() => {
    fetchLatestRates();
  }, []);

  const fetchLatestRates = async () => {
    try {
      const response = await api.get('/api/exchange-rates/latest');
      setRates(response.data);
    } catch (error) {
      console.error('خطأ في جلب أسعار الصرف:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/exchange-rates', {
        rate_usd_to_lyd: parseFloat(newUsdToLyd),
        rate_lyd_to_usd: parseFloat(newLydToUsd)
      });
      alert('تم تحديث أسعار الصرف بنجاح');
      fetchLatestRates();
      setNewUsdToLyd('');
      setNewLydToUsd('');
    } catch (error) {
      console.error('خطأ في تحديث أسعار الصرف:', error);
      alert('حدث خطأ أثناء تحديث أسعار الصرف');
    }
  };

  if (!rates) {
    return <div>جاري تحميل أسعار الصرف...</div>;
  }

  return (
    <div>
      <h1>أسعار الصرف الحالية</h1>
      <p>سعر الدولار مقابل الدينار الليبي: {rates.rate_usd_to_lyd}</p>
      <p>سعر الدينار الليبي مقابل الدولار: {rates.rate_lyd_to_usd}</p>
      <p>آخر تحديث: {new Date(rates.created_at).toLocaleString()}</p>

      <h2>تحديث أسعار الصرف</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="سعر الدولار مقابل الدينار الليبي"
          value={newUsdToLyd}
          onChange={(e) => setNewUsdToLyd(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="سعر الدينار الليبي مقابل الدولار"
          value={newLydToUsd}
          onChange={(e) => setNewLydToUsd(e.target.value)}
          required
        />
        <button type="submit">تحديث الأسعار</button>
      </form>
    </div>
  );
};

export default ExchangeRates;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExchangeRates() {
  const [rates, setRates] = useState(null);
  const [newUsdToLyd, setNewUsdToLyd] = useState('');
  const [newLydToUsd, setNewLydToUsd] = useState('');

  useEffect(() => {
    fetchLatestRates();
  }, []);

  const fetchLatestRates = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/exchange-rates/latest');
      setRates(response.data);
    } catch (error) {
      console.error('خطأ في جلب أسعار الصرف:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/exchange-rates', {
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
      <h2>أسعار الصرف الحالية</h2>
      <p>سعر الدولار مقابل الدينار الليبي: {rates.rate_usd_to_lyd}</p>
      <p>سعر الدينار الليبي مقابل الدولار: {rates.rate_lyd_to_usd}</p>
      <p>آخر تحديث: {new Date(rates.created_at).toLocaleString()}</p>

      <h3>تحديث أسعار الصرف</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usdToLyd">سعر الدولار مقابل الدينار الليبي:</label>
          <input
            type="number"
            id="usdToLyd"
            step="0.0001"
            value={newUsdToLyd}
            onChange={(e) => setNewUsdToLyd(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lydToUsd">سعر الدينار الليبي مقابل الدولار:</label>
          <input
            type="number"
            id="lydToUsd"
            step="0.0001"
            value={newLydToUsd}
            onChange={(e) => setNewLydToUsd(e.target.value)}
            required
          />
        </div>
        <button type="submit">تحديث الأسعار</button>
      </form>
    </div>
  );
}

export default ExchangeRates;
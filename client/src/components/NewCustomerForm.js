import React, { useState } from 'react';
import api from '../utils/api';
import Modal from 'react-modal';

// Set the app element for accessibility reasons
Modal.setAppElement('#root');

function NewCustomerForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/customers', { name, phone });
      alert('تمت إضافة العميل بنجاح');
      setModalIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
      alert('حدث خطأ أثناء إضافة العميل');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">إضافة عميل جديد</h1>
      <button 
        onClick={() => setModalIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        إضافة عميل جديد
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="نموذج إضافة عميل جديد"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl font-bold mb-4">إضافة عميل جديد</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">الاسم:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-1">رقم الهاتف:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            إضافة العميل
          </button>
          <button 
            type="button" 
            onClick={() => setModalIsOpen(false)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            إلغاء
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default NewCustomerForm;
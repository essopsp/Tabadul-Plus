import React, { useState } from 'react';
import api from '../utils/api';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const Treasury = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const translateReportType = (type) => {
    const translations = {
      'daily': 'يومي',
      'revenue': 'الإيرادات',
      'sales': 'المبيعات',
      'purchases': 'المشتريات',
      'customers': 'العملاء',
      'customer_transactions': 'حركات العملاء'
    };
    return translations[type] || type;
  };

  const generateReport = async () => {
    try {
      setError(null);
      console.log('Generating report with params:', { reportType, startDate, endDate });
      const response = await api.get('/api/reports', {
        params: { type: reportType, startDate, endDate }
      });
      console.log('Report response:', response.data);
      if (response.data && response.data.message) {
        setError(response.data.message);
        setReportData(null);
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setReportData(response.data);
      } else {
        setError('لا توجد بيانات للفترة المحددة');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error in generateReport:', error);
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      setReportData(null);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(data, `تقرير_${translateReportType(reportType)}_${startDate}_${endDate}.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Report</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid black; padding: 8px; text-align: right; }
      th { background-color: #f2f2f2; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(`<h1>تقرير ${translateReportType(reportType)}</h1>`);
    printWindow.document.write(`<p>من تاريخ: ${startDate} إلى تاريخ: ${endDate}</p>`);
    printWindow.document.write(renderReportTable());
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = function() {
      printWindow.close();
    };
  };

  const translateHeaders = (headers) => {
    const translations = {
      'customer_id': 'رقم العميل',
      'customer_name': 'اسم العميل',
      'customer_phone': 'رقم الهاتف',
      'transaction_id': 'رقم المعاملة',
      'transaction_type': 'نوع المعاملة',
      'currency': 'العملة',
      'amount': 'المبلغ',
      'paid_amount': 'المبلغ المدفوع',
      'rate': 'سعر الصرف',
      'transaction_date': 'تاريخ المعاملة',
      'description': 'الوصف',
      'created_by': 'تم الإنشاء بواسطة',
      'is_completed': 'مكتملة',
      'remaining_amount': 'المبلغ المتبقي'
    };
    return headers.map(header => translations[header] || header);
  };

  const renderReportTable = () => {
    if (!reportData || reportData.length === 0) return '<p>لا توجد بيانات للعرض</p>';

    const headers = Object.keys(reportData[0]);
    const translatedHeaders = translateHeaders(headers);

    let tableHtml = '<table><thead><tr>';
    translatedHeaders.forEach(header => {
      tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    reportData.forEach(row => {
      tableHtml += '<tr>';
      headers.forEach(header => {
        let cellValue = row[header];
        if (header === 'transaction_date' || header === 'date') {
          cellValue = new Date(cellValue).toLocaleDateString('ar-EG');
        } else if (typeof cellValue === 'number') {
          cellValue = cellValue.toFixed(2);
        } else if (header === 'transaction_type') {
          cellValue = translateTransactionType(cellValue);
        }
        tableHtml += `<td>${cellValue}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
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
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">الخزينة والتقارير</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2">نوع التقرير:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="daily">تقرير يومي</option>
            <option value="revenue">تقرير الإيرادات</option>
            <option value="sales">تقرير المبيعات</option>
            <option value="purchases">تقرير المشتريات</option>
            <option value="customers">تقرير العملاء</option>
            <option value="customer_transactions">تقرير حركات العملاء</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">تاريخ البداية:</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">تاريخ النهاية:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button 
          onClick={generateReport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          إنشاء التقرير
        </button>

        {reportData && (
          <>
            <button 
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              تصدير إلى Excel
            </button>
            <button 
              onClick={handlePrint}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              طباعة التقرير
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">تنبيه: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {reportData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">نتائج التقرير:</h2>
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {translateHeaders(Object.keys(reportData[0])).map((header) => (
                    <th key={header} className="px-4 py-2 border-b">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key} className="px-4 py-2 border-b">
                        {key === 'transaction_date' || key === 'date' ? new Date(value).toLocaleString('ar-EG') : 
                         typeof value === 'number' ? value.toFixed(2) : 
                         key === 'transaction_type' ? translateTransactionType(value) :
                         key === 'is_completed' ? (value ? 'نعم' : 'لا') :
                         value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Treasury;
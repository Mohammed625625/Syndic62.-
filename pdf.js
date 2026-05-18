// ===== نظام تقارير PDF =====
// استخدام jsPDF و html2canvas (يتم تحميلهما من CDN)

async function generatePaymentsPDF(month, year) {
  // استيراد المكتبات
  const script1 = document.createElement('script');
  script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  document.head.appendChild(script1);
  
  script1.onload = () => {
    const data = JSON.parse(localStorage.getItem('syndic62') || '{}');
    const key = year + '-' + month;
    const payments = data.payments[key] || {};
    
    const monthName = getMonthName(month);
    const title = `تقرير المستحقات - ${monthName} ${year}`;
    
    let html = `
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial'; direction: rtl; padding: 20px; }
          h1 { text-align: center; color: #0f7a54; margin-bottom: 20px; }
          .header-info { background: #f0f4f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .header-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
          th { background: #0f7a54; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
          .paid { background: #d1f0e4; color: #0f7a54; }
          .unpaid { background: #fee2e2; color: #dc2626; }
          .summary { margin-top: 20px; padding: 15px; background: #d1f0e4; border-radius: 8px; }
          .summary p { margin: 8px 0; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📋 ${title}</h1>
        
        <div class="header-info">
          <p><strong>اسم العمارة:</strong> ${data.buildingName || 'غير محدد'}</p>
          <p><strong>الاشتراك الشهري:</strong> ${data.fee || 50} درهم</p>
          <p><strong>إجمالي الشقق:</strong> ${data.aptCount || 21}</p>
          <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-MA')}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>الشقة</th>
              <th>اسم الساكن</th>
              <th>رقم الهاتف</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    const paid = [];
    const unpaid = [];
    
    (data.aptNumbers || []).forEach(apt => {
      const contact = data.contacts[apt] || { name: 'بدون بيانات', phone: '' };
      const isPaid = payments[apt];
      
      if (isPaid) paid.push(apt);
      else unpaid.push(apt);
      
      const status = isPaid ? '<span class="paid">✓ مسدد</span>' : '<span class="unpaid">✗ متأخر</span>';
      html += `
        <tr>
          <td>${apt}</td>
          <td>${contact.name}</td>
          <td>${contact.phone || '-'}</td>
          <td>${status}</td>
        </tr>
      `;
    });
    
    const totalPaid = paid.length * (data.fee || 50);
    const totalUnpaid = unpaid.length * (data.fee || 50);
    const totalAmount = (data.aptCount || 21) * (data.fee || 50);
    const percentage = Math.round((paid.length / (data.aptCount || 21)) * 100);
    
    html += `
          </tbody>
        </table>
        
        <div class="summary">
          <h3 style="color: #0f7a54; margin-top: 0;">📊 ملخص التقرير</h3>
          <p><strong>المسددين:</strong> ${paid.length} من ${data.aptCount || 21} (${percentage}%)</p>
          <p><strong>المتأخرين:</strong> ${unpaid.length}</p>
          <p><strong>المبلغ المجموع:</strong> ${totalAmount.toLocaleString()} درهم</p>
          <p><strong>المبلغ المستقبل:</strong> ${totalPaid.toLocaleString()} درهم</p>
          <p><strong>المبلغ المتأخر:</strong> ${totalUnpaid.toLocaleString()} درهم</p>
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير بواسطة سنديك 62</p>
          <p>${new Date().toLocaleString('ar-MA')}</p>
        </div>
      </body>
      </html>
    `;
    
    // تحميل PDF
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 10,
      filename: `payments_${year}_${month}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
}

async function generateExpensesPDF(month, year) {
  const script1 = document.createElement('script');
  script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  document.head.appendChild(script1);
  
  script1.onload = () => {
    const data = JSON.parse(localStorage.getItem('syndic62') || '{}');
    const key = year + '-' + month;
    const expenses = (data.expenses || []).filter(e => e.month === key);
    
    const monthName = getMonthName(month);
    const title = `تقرير المصاريف - ${monthName} ${year}`;
    
    let html = `
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial'; direction: rtl; padding: 20px; }
          h1 { text-align: center; color: #0f7a54; margin-bottom: 20px; }
          .header-info { background: #f0f4f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .header-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
          th { background: #0f7a54; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
          .summary { margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; }
          .summary p { margin: 8px 0; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>💸 ${title}</h1>
        
        <div class="header-info">
          <p><strong>اسم العمارة:</strong> ${data.buildingName || 'غير محدد'}</p>
          <p><strong>عدد المصاريف:</strong> ${expenses.length}</p>
          <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-MA')}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>المبلغ (درهم)</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    let totalAmount = 0;
    const typeStats = {};
    
    expenses.forEach(exp => {
      totalAmount += exp.amount || 0;
      typeStats[exp.type] = (typeStats[exp.type] || 0) + (exp.amount || 0);
      
      const date = exp.date ? new Date(exp.date).toLocaleDateString('ar-MA') : '-';
      html += `
        <tr>
          <td>${date}</td>
          <td>${exp.type}</td>
          <td>${exp.desc}</td>
          <td>${(exp.amount || 0).toLocaleString()}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
        
        <div class="summary">
          <h3 style="color: #0f7a54; margin-top: 0;">📊 ملخص التقرير</h3>
          <p><strong>إجمالي المصاريف:</strong> ${totalAmount.toLocaleString()} درهم</p>
          <h4>توزيع المصاريف:</h4>
    `;
    
    Object.entries(typeStats).forEach(([type, amount]) => {
      const percent = Math.round((amount / totalAmount) * 100);
      html += `<p>${type}: ${amount.toLocaleString()} درهم (${percent}%)</p>`;
    });
    
    html += `
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير بواسطة سنديك 62</p>
          <p>${new Date().toLocaleString('ar-MA')}</p>
        </div>
      </body>
      </html>
    `;
    
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 10,
      filename: `expenses_${year}_${month}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
}

function generateResidentPDF(apt, year) {
  const script1 = document.createElement('script');
  script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  document.head.appendChild(script1);
  
  script1.onload = () => {
    const data = JSON.parse(localStorage.getItem('syndic62') || '{}');
    const contact = data.contacts[apt] || { name: 'غير معروف' };
    
    let html = `
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial'; direction: rtl; padding: 20px; }
          h1 { text-align: center; color: #0f7a54; margin-bottom: 20px; }
          .card { background: linear-gradient(135deg, #0f7a54, #1ac882); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .card h2 { font-size: 24px; margin: 0 0 10px 0; }
          .card p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: right; border: 1px solid #ddd; }
          th { background: #0f7a54; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
          .paid { color: #16a34a; font-weight: bold; }
          .unpaid { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🏠 الشقة رقم ${apt}</h2>
          <p><strong>الساكن:</strong> ${contact.name}</p>
          <p><strong>الهاتف:</strong> ${contact.phone || '-'}</p>
          <p><strong>السنة:</strong> ${year}</p>
        </div>
        
        <h3>📅 سجل الدفع - ${year}</h3>
        <table>
          <thead>
            <tr>
              <th>الشهر</th>
              <th>المبلغ (درهم)</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    let totalPaid = 0;
    
    months.forEach((month, i) => {
      const key = year + '-' + (i + 1);
      const payments = data.payments[key] || {};
      const isPaid = payments[apt];
      const status = isPaid ? '<span class="paid">✓ مسدد</span>' : '<span class="unpaid">✗ متأخر</span>';
      
      if (isPaid) totalPaid += data.fee || 50;
      
      html += `
        <tr>
          <td>${month}</td>
          <td>${data.fee || 50}</td>
          <td>${status}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #d1f0e4; border-radius: 8px;">
          <p><strong>إجمالي المدفوع:</strong> ${totalPaid.toLocaleString()} درهم</p>
          <p><strong>الإجمالي المستحق:</strong> ${(12 * (data.fee || 50)).toLocaleString()} درهم</p>
          <p><strong>المتبقي:</strong> ${((12 * (data.fee || 50)) - totalPaid).toLocaleString()} درهم</p>
        </div>
        
        <div class="footer">
          <p>هذا التقرير يخصك وحدك</p>
          <p>${new Date().toLocaleString('ar-MA')}</p>
        </div>
      </body>
      </html>
    `;
    
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 10,
      filename: `resident_${apt}_${year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
}

function getMonthName(monthNum) {
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return months[monthNum - 1] || '';
}

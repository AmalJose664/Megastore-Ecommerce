import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface CSVColumn {
  key: string;
  label: string;
}

/**
  * Export array of objects to CSV file download
  */
export const exportToCSV = (data: any[], filename: string, columns?: CSVColumn[]) => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  let headers: string[] = [];
  let keys: string[] = [];

  if (columns && columns.length > 0) {
    headers = columns.map((c) => c.label);
    keys = columns.map((c) => c.key);
  } else {
    keys = Object.keys(data[0]);
    headers = keys.map((k) => k.toUpperCase());
  }

  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  for (const row of data) {
    const values = keys.map((key) => {
      const val = getNestedValue(row, key);
      const strVal = val === null || val === undefined ? '' : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
  * Export Summary Data to PDF Report
  */
export const exportReportPDF = (
  title: string,
  data: any[],
  columns: { key: string; label: string }[],
  filename: string
) => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title & Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 14, 25);

  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 28, pageWidth - 14, 28);

  // Simple Table Data Output
  let y = 36;
  const colWidth = (pageWidth - 28) / columns.length;

  // Header Row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);

  columns.forEach((col, idx) => {
    doc.text(col.label.substring(0, 18), 14 + idx * colWidth, y);
  });

  y += 6;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  data.slice(0, 35).forEach((row) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }
    columns.forEach((col, idx) => {
      const rawVal = getNestedValue(row, col.key);
      const strVal = rawVal === null || rawVal === undefined ? '-' : String(rawVal);
      doc.text(strVal.substring(0, 22), 14 + idx * colWidth, y);
    });
    y += 6;
  });

  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

function getNestedValue(obj: any, path: string): any {
  if (!obj) return '';
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
}

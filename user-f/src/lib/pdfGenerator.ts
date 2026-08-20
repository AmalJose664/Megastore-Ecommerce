import { jsPDF } from 'jspdf';

export interface PdfSiteSettings {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  currencySymbol?: string;
}

export function generateOrderPdf(order: any, settings?: PdfSiteSettings) {
  const doc = new jsPDF();
  const siteTitle = settings?.siteName || 'MegaStore';
  const contactEmail = settings?.contactEmail || 'support@megastore.com';
  const contactPhone = settings?.contactPhone || '+1 (800) 123-4567';
  const siteAddress = settings?.address || '123 E-Commerce Way, Tech City, TC 10001';
  const currency = settings?.currencySymbol || '₹';

  let y = 18;

  // App / Site Header
  doc.setFontSize(22);
  doc.text(siteTitle, 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.text(`Contact: ${contactEmail} | Phone: ${contactPhone}`, 14, y);
  y += 5;
  doc.text(`Address: ${siteAddress}`, 14, y);
  y += 6;
  doc.line(14, y, 196, y);

  // Invoice Title & Meta
  y += 10;
  doc.setFontSize(16);
  doc.text('TAX INVOICE / ORDER RECEIPT', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.text(`Order #: ${order.orderNumber}`, 14, y);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, y);
  y += 6;
  doc.text(`Status: ${order.status.toUpperCase()}`, 14, y);
  doc.text(`Payment: ${order.paymentMethod.toUpperCase()}`, 120, y);

  // Shipping Address
  y += 12;
  doc.setFontSize(11);
  doc.text('Shipping Address:', 14, y);
  y += 6;
  doc.setFontSize(10);
  const addr = order.shippingAddress;
  doc.text(`${addr.fullName} (${addr.phone})`, 14, y);
  y += 5;
  doc.text(`${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`, 14, y);
  y += 5;
  doc.text(`${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`, 14, y);

  // Table Header
  y += 12;
  doc.setFontSize(11);
  doc.text('Item', 14, y);
  doc.text('Qty', 110, y);
  doc.text('Unit Price', 135, y);
  doc.text('Total', 170, y);
  y += 3;
  doc.line(14, y, 196, y);

  // Table Rows
  doc.setFontSize(10);
  order.items.forEach((item: any) => {
    y += 8;
    const title = item.name.length > 42 ? item.name.substring(0, 39) + '...' : item.name;
    doc.text(title, 14, y);
    doc.text(String(item.quantity), 112, y);
    doc.text(`${currency}${item.price.toFixed(2)}`, 135, y);
    doc.text(`${currency}${(item.price * item.quantity).toFixed(2)}`, 170, y);
  });

  y += 6;
  doc.line(14, y, 196, y);

  // Totals Breakdown
  y += 8;
  doc.text(`Subtotal: ${currency}${order.subtotal.toFixed(2)}`, 135, y);
  y += 6;
  if (order.discount > 0) {
    doc.text(`Discount: -${currency}${order.discount.toFixed(2)}`, 135, y);
    y += 6;
  }
  doc.text(`Shipping: ${currency}${order.shippingFee.toFixed(2)}`, 135, y);
  y += 6;
  doc.text(`Tax: ${currency}${order.tax.toFixed(2)}`, 135, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`Total Paid: ${currency}${order.total.toFixed(2)}`, 135, y);

  // Save File
  doc.save(`Invoice_${order.orderNumber}.pdf`);
}

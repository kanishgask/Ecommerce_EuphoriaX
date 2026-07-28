import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    backgroundColor: '#ffffff', 
    color: '#1a1a2e' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderBottom: '2 border #7c3aed', 
    paddingBottom: 20, 
    marginBottom: 20 
  },
  brand: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#7c3aed' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1a1a2e', 
    textAlign: 'right' 
  },
  subtitle: { 
    fontSize: 10, 
    color: '#666666', 
    textAlign: 'right', 
    marginTop: 4 
  },
  section: { 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#7c3aed', 
    textTransform: 'uppercase', 
    marginBottom: 8, 
    borderBottom: '1 border #eeeeee', 
    paddingBottom: 4 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  label: { 
    fontSize: 10, 
    color: '#666666', 
    width: '40%' 
  },
  value: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#1a1a2e', 
    width: '60%' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f4f0ff', 
    padding: 8, 
    borderRadius: 4, 
    marginBottom: 8 
  },
  tableRow: { 
    flexDirection: 'row', 
    padding: 8, 
    borderBottom: '1 border #eeeeee' 
  },
  colName: { 
    width: '50%', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  colQty: { 
    width: '20%', 
    fontSize: 10, 
    textAlign: 'center' 
  },
  colPrice: { 
    width: '30%', 
    fontSize: 10, 
    textAlign: 'right', 
    fontWeight: 'bold' 
  },
  totalSection: { 
    marginTop: 20, 
    padding: 12, 
    backgroundColor: '#f9f8fc', 
    borderRadius: 6, 
    alignItems: 'flex-end' 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '60%', 
    marginBottom: 4 
  },
  totalLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#666666' 
  },
  totalValue: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#7c3aed' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    borderTop: '1 border #eeeeee', 
    paddingTop: 10, 
    textAlign: 'center', 
    fontSize: 9, 
    color: '#999999' 
  }
});

export const InvoiceDocument = ({ order }) => {
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    { name: 'Premium E-Commerce Merchandise / Order Package', quantity: typeof order.items === 'number' ? order.items : 1, price: order.total || '$99.00' }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EuphoriaX</Text>
            <Text style={{ fontSize: 10, color: '#666666', marginTop: 4 }}>Premium E-Commerce Platform</Text>
            <Text style={{ fontSize: 9, color: '#888888' }}>support@euphoriax.com</Text>
          </View>
          <View>
            <Text style={styles.title}>TAX INVOICE</Text>
            <Text style={styles.subtitle}>Order ID: {order.id || '#ORD-8821'}</Text>
            <Text style={styles.subtitle}>Date: {order.date || new Date().toLocaleDateString()}</Text>
            <Text style={styles.subtitle}>Status: {order.status || 'DELIVERED'}</Text>
          </View>
        </View>

        {/* Customer & Logistics Info */}
        <View style={{ flexDirection: 'row', justifyBetween: 'space-between', marginBottom: 25 }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{order.customer || 'Valued Customer'}</Text>
            <Text style={{ fontSize: 10, color: '#555555' }}>{order.email || ''}</Text>
            <Text style={{ fontSize: 10, color: '#555555', marginTop: 4 }}>{order.shippingAddress || '742 Luxury Avenue, Suite 100, New York, NY 10001, USA'}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Payment & Logistics</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{order.paymentMethod || 'Credit Card (Online)'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tracking No:</Text>
              <Text style={styles.value}>{order.trackingNumber || 'EX-LOGISTICS-US'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Delivery Status:</Text>
              <Text style={styles.value}>{order.estimatedDelivery || order.status || 'Verified Shipment'}</Text>
            </View>
          </View>
        </View>

        {/* Items Manifest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Manifest</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colName}>Item Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Amount</Text>
          </View>
          {items.map((item, idx) => {
            const priceStr = typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : (item.price || '$0.00');
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colName}>{item.name || `Product Item #${idx + 1}`}</Text>
                <Text style={styles.colQty}>{item.quantity || 1}</Text>
                <Text style={styles.colPrice}>{priceStr}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 10, color: '#666666' }}>Subtotal:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{order.total || '$0.00'}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 10, color: '#666666' }}>Shipping & Handling:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#16a34a' }}>FREE</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 10, color: '#666666' }}>Estimated Tax (0%):</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>$0.00</Text>
          </View>
          <View style={{ ...styles.totalRow, marginTop: 8, borderTop: '1 border #dddddd', paddingTop: 8 }}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>{order.total || '$0.00'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing EuphoriaX! This is an official computer-generated tax invoice.</Text>
          <Text style={{ marginTop: 2 }}>EuphoriaX Technologies Inc. • 100 Innovation Way, Suite 400 • www.euphoriax.com</Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadOrderInvoice = async (order) => {
  const toastId = toast.loading(`Generating verified PDF invoice for ${order.id}...`);
  const cleanId = (order.id || 'ORDER').toString().replace(/[^a-zA-Z0-9]/g, '-');
  
  try {
    const doc = <InvoiceDocument order={order} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    saveAs(blob, `EuphoriaX-Invoice-${cleanId}.pdf`);
    toast.success(`Invoice EuphoriaX-Invoice-${cleanId}.pdf saved to your computer!`, { id: toastId });
  } catch (err) {
    console.warn("PDF generator fallback to Blob HTML download:", err);
    try {
      // Fallback HTML invoice if React-PDF renderer encounters browser stream issues
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>EuphoriaX Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 28px; font-weight: bold; color: #7c3aed; }
            .title { font-size: 22px; font-weight: bold; text-align: right; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { width: 48%; }
            h4 { color: #7c3aed; text-transform: uppercase; font-size: 13px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f0ff; padding: 10px; text-align: left; font-size: 13px; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-box { margin-top: 30px; background: #f9f8fc; padding: 20px; border-radius: 8px; text-align: right; }
            .total-val { font-size: 24px; font-weight: bold; color: #7c3aed; margin-top: 10px; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #888; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">EuphoriaX</div>
              <div style="font-size: 13px; color: #666;">Premium E-Commerce Platform</div>
            </div>
            <div>
              <div class="title">TAX INVOICE</div>
              <div style="font-size: 14px; color: #555;">Order ID: ${order.id}</div>
              <div style="font-size: 14px; color: #555;">Date: ${order.date || new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="info-grid">
            <div class="box">
              <h4>Billed To</h4>
              <strong>${order.customer || 'Valued Customer'}</strong><br/>
              <span style="font-size: 13px; color: #555;">${order.email || ''}</span><br/>
              <span style="font-size: 13px; color: #555;">${order.shippingAddress || 'Standard Registered Address'}</span>
            </div>
            <div class="box">
              <h4>Payment & Shipping</h4>
              <strong>Payment Method:</strong> ${order.paymentMethod || 'Credit Card'}<br/>
              <strong>Tracking Number:</strong> ${order.trackingNumber || 'EX-LOGISTICS'}<br/>
              <strong>Status:</strong> ${order.status || 'Delivered'}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item Description</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              ${(Array.isArray(order.items) ? order.items : [{ name: 'Order Package', quantity: 1, price: order.total }]).map(it => `
                <tr>
                  <td>${it.name || 'Product Item'}</td>
                  <td style="text-align: center;">${it.quantity || 1}</td>
                  <td style="text-align: right; font-weight: bold;">${typeof it.price === 'number' ? `$${it.price.toFixed(2)}` : (it.price || order.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            <div>Subtotal: <strong>${order.total || '$0.00'}</strong></div>
            <div>Shipping: <strong style="color: green;">FREE</strong></div>
            <div class="total-val">Total Paid: ${order.total || '$0.00'}</div>
          </div>
          <div class="footer">
            Thank you for shopping with EuphoriaX! • www.euphoriax.com<br/>
            <button onclick="window.print()" style="margin-top: 15px; padding: 10px 20px; background: #7c3aed; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Print / Save PDF Now</button>
          </div>
          <script>
            setTimeout(() => window.print(), 500);
          </script>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      saveAs(blob, `EuphoriaX-Invoice-${cleanId}.html`);
      toast.success(`Invoice EuphoriaX-Invoice-${cleanId}.html saved to your computer!`, { id: toastId });
    } catch (fallbackErr) {
      toast.error("Could not download invoice.", { id: toastId });
    }
  }
};

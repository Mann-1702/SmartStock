const nodemailer = require('nodemailer');

// Function to create transporter dynamically (ensures env vars are loaded)
function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  console.log('Creating email transporter with:');
  console.log(`  - Service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
  console.log(`  - User: ${emailUser ? 'Set' : 'Not Set'}`);
  console.log(`  - Password: ${emailPassword ? 'Set' : 'Not Set'}`);

  if (!emailUser || !emailPassword) {
    console.error('Email credentials are missing!');
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword.trim() // Remove any whitespace
    }
  });
}

/**
 * Send auto-order notification email to manager/employee
 * @param {string} recipientEmail - Email of the manager/employee
 * @param {string} recipientName - Name of the manager/employee
 * @param {Object} autoOrderData - Auto-order details
 * @param {string} autoOrderData.productName - Name of the product
 * @param {number} autoOrderData.orderedQuantity - Quantity ordered
 * @param {number} autoOrderData.currentStock - Current stock level
 * @param {number} autoOrderData.threshold - Stock threshold
 * @returns {Promise<Object>} - Result of email sending
 */
async function sendAutoOrderNotification(recipientEmail, recipientName, autoOrderData) {
  try {
    // Create transporter each time to ensure fresh environment variables
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error(`Cannot send email - transporter creation failed`);
      return { success: false, reason: 'Email transporter not configured' };
    }

    const emailContent = `
      <h2>🔔 Auto-Order Notification</h2>
      <p>Hi ${recipientName},</p>
      <p>A new auto-order has been triggered due to low stock levels:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Product Name</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${autoOrderData.productName}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Quantity Ordered</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${autoOrderData.orderedQuantity} units</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Current Stock</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${autoOrderData.currentStock} units</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Stock Threshold</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${autoOrderData.threshold} units</td>
        </tr>
        <tr style="background-color: #ffe6e6;">
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Status</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">Order Placed</td>
        </tr>
      </table>
      <p><strong>Action Required:</strong> Please review this auto-order in your SmartStock dashboard and confirm with the vendor if necessary.</p>
      <hr style="margin: 20px 0;">
      <p>Best regards,<br/>SmartStock System</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `⚠️ Auto-Order Alert: ${autoOrderData.productName}`,
      html: emailContent
    };

    console.log(`Attempting to send email to ${recipientEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${recipientEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Send bulk auto-order notifications to all managers/employees
 * @param {Array} recipients - Array of {email, name} objects
 * @param {Object} autoOrderData - Auto-order details
 * @returns {Promise<Array>} - Array of results for each recipient
 */
async function sendBulkAutoOrderNotifications(recipients, autoOrderData) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendAutoOrderNotification(
      recipient.email,
      recipient.name,
      autoOrderData
    );
    results.push({
      recipient: recipient.email,
      ...result
    });
  }

  return results;
}

module.exports = {
  sendAutoOrderNotification,
  sendBulkAutoOrderNotifications
};

/**
 * Email Service using NotificationAPI SDK
 */
const notificationapi = require('notificationapi-node-server-sdk').default;

export async function sendWelcomeEmail(options: any) {
  const { email, password, role, company } = options;

  // Check if NotificationAPI credentials are configured
  if (!process.env.NOTIFICATIONAPI_CLIENT_ID || !process.env.NOTIFICATIONAPI_CLIENT_SECRET) {
    console.log('⚠️ NotificationAPI credentials not configured, skipping email');
    return { success: true, message: 'Email skipped - credentials not configured' };
  }

  try {
    console.log('Sending email via NotificationAPI SDK...');
    
    // Initialize NotificationAPI
    notificationapi.init(
      process.env.NOTIFICATIONAPI_CLIENT_ID,
      process.env.NOTIFICATIONAPI_CLIENT_SECRET
    );

    // HTML email template
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F6FA; border-radius: 12px; overflow: hidden;">
        <div style="width: 100%; height: 8px; background: linear-gradient(to right, #1A245E, #C7322F);"></div>
        <div style="padding: 30px 20px; text-align: center;">
          <img src="https://datatim.co.za/wp-content/uploads/2017/05/eps-logo.jpg" alt="EPS Courier Services" style="width: 80px; height: 80px; margin-bottom: 15px;">
          <h1 style="color: #1A245E; font-size: 28px; margin: 0 0 5px 0;">EPS Courier Services</h1>
          <p style="color: #666; font-size: 14px; margin: 0;">Reliable. Professional. Nationwide.</p>
          <h2 style="color: #1A245E; font-size: 20px; margin: 20px 0 0 0;">Welcome to Your Account</h2>
        </div>
        <div style="padding: 30px 20px; background-color: white;">
          <p style="color: #333; font-size: 16px;"><strong>Hello,</strong></p>
          <p style="color: #333; font-size: 16px;">Your EPS account has been created successfully. Please use the credentials below to access the system:</p>
          <div style="background: #F5F6FA; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1A245E;">
            <p style="margin: 8px 0; color: #333;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Company:</strong> ${company}</p>
          </div>
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #C7322F;">
            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Security Notice:</strong> Please change your password after your first login for security purposes.</p>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #1A245E 0%, #1A245E/70 50%, #C7322F/70 100%); padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: white; margin: 0;">
            This is an automated message from EPS Courier Services.<br>
            © ${new Date().getFullYear()} EPS Courier Services. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send notification using correct format
    const result = await notificationapi.send({
      type: 'welcome',
      to: {
        id: email,
        email: email
      },
      email: {
        subject: 'Welcome to EPS Courier Services - Your Account Credentials',
        html: emailHTML
      }
    });

    console.log('✅ Email sent successfully via NotificationAPI SDK');
    return { success: true, messageId: 'sdk-sent', provider: 'notificationapi' };
    
  } catch (error: any) {
    console.error('❌ NotificationAPI SDK failed:', error.message || error);
    return { success: false, error: error.message || 'SDK error' };
  }
}

// Generate random password
export function generateTempPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
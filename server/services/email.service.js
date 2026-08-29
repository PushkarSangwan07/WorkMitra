// Email service completely disabled

const sendEmail = async () => {
  return { success: true };
};

const sendPasswordResetEmail = async () => {
  return { success: true };
};

const sendVerificationOtpEmail = async () => {
  return { success: true };
};

const sendBanAppealEmailToAdmin = async () => {
  return { success: true };
};

const sendBanNotificationEmail = async () => {
  return { success: true };
};

const sendUnbanNotificationEmail = async () => {
  return { success: true };
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
  sendBanAppealEmailToAdmin,
  sendBanNotificationEmail,
  sendUnbanNotificationEmail
};








// const nodemailer = require('nodemailer');

// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT) || 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// const sendEmail = async ({ to, subject, html }) => {
//   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     console.log('\n──────────────────────────────────────────');
//     console.log(`📧  EMAIL NOT SENT (SMTP not configured)`);
//     console.log(`To:      ${to}`);
//     console.log(`Subject: ${subject}`);
//     // Extract any URL or OTP from the HTML for easy dev testing
//     const urlMatch = html.match(/href="(https?:\/\/[^"]+)"/);
//     const otpMatch = html.match(/<strong[^>]*>([\d]{6})<\/strong>/);
    
//     if (urlMatch) {
//       console.log(`\n🔗  LINK (click to test):\n    ${urlMatch[1]}`);
//     }
//     if (otpMatch) {
//       console.log(`\n🔑  OTP CODE:\n    ${otpMatch[1]}`);
//     }
//     console.log('──────────────────────────────────────────\n');
//     return;
//   }

//   const transporter = createTransporter();

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM || 'WorkMitra <no-reply@workmitra.com>',
//     to,
//     subject,
//     html,
//   });
// };

// const sendPasswordResetEmail = async (to, resetUrl) => {
//   await sendEmail({
//     to,
//     subject: 'Reset your WorkMitra password',
//     html: `
//       <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
//         <h2>Reset your password</h2>
//         <p>You requested a password reset for your WorkMitra account. This link expires in 15 minutes.</p>
//         <p><a href="${resetUrl}" style="background:#1e9e58;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
//         <p>If you didn't request this, you can safely ignore this email.</p>
//       </div>
//     `,
//   });
// };

// // --- NEW FEATURES START HERE ---

// const sendVerificationOtpEmail = async (to, name, otpCode) => {
//   await sendEmail({
//     to,
//     subject: 'Verify your WorkMitra Account',
//     html: `
//       <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
//         <h2>Welcome to WorkMitra, ${name}!</h2>
//         <p>Your verification code is: <strong style="font-size: 24px; color: #f97316; letter-spacing: 2px;">${otpCode}</strong></p>
//         <p>This code expires in 10 minutes.</p>
//         <p>If you didn't create an account, you can safely ignore this email.</p>
//       </div>
//     `,
//   });
// };

// const sendBanAppealEmailToAdmin = async (worker, message) => {
//   // Sends to your configured support email, or falls back to your SMTP user
//   const adminEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@workmitra.com';
  
//   await sendEmail({
//     to: adminEmail,
//     subject: `🚨 Urgent: Ban Appeal from ${worker.name}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
//         <h3 style="color: #dc2626;">🚨 New Ban Appeal Received</h3>
//         <p><strong>Worker Name:</strong> ${worker.name}</p>
//         <p><strong>Worker Email:</strong> ${worker.email}</p>
//         <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
//           <p><strong>Worker's Message:</strong></p>
//           <p style="white-space: pre-wrap;">${message}</p>
//         </div>
//         <p style="margin-top: 20px;">Please review their profile and reports in the Admin Dashboard to take action.</p>
//       </div>
//     `,
//   });
// };

// const sendBanNotificationEmail = async (email, name, reason) => {
//   // Use your live URL in production, fallback to localhost for testing
//   const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
//   // This creates a link like: http://localhost:5173/login?appeal=true&email=worker@example.com
//   const appealLink = `${clientUrl}/login?appeal=true&email=${encodeURIComponent(email)}`;

//   await sendEmail({
//     to: email,
//     subject: '⚠️ Important: Your WorkMitra Account Has Been Suspended',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
//         <h2 style="color: #ef4444;">Account Suspended</h2>
//         <p>Hello ${name},</p>
//         <p>We are writing to inform you that your account on WorkMitra has been suspended by our administration team.</p>
//         <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
//           <p style="margin: 0; color: #991b1b;"><strong>Reason for suspension:</strong></p>
//           <p style="margin: 5px 0 0 0; color: #7f1d1d;">${reason}</p>
//         </div>
//         <p>While suspended, you will not be able to log in, accept bookings, or interact with customers.</p>
//         <p>If you believe this was a mistake, you can click the button below to submit an appeal directly to our Trust & Safety team.</p>
        
//         <div style="margin-top: 25px; margin-bottom: 25px;">
//           <a href="${appealLink}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Appeal Suspension</a>
//         </div>
        
//         <p>Regards,<br/>The WorkMitra Trust & Safety Team</p>
//       </div>
//     `
//   });
// };

// const sendUnbanNotificationEmail = async (to, name) => {
//   await sendEmail({
//     to,
//     subject: 'Your WorkMitra Account has been Restored 🎉',
//     html: `
//       <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
//         <h2>Good news, ${name}!</h2>
//         <p>We have carefully reviewed your appeal and your account has been <strong>successfully unbanned</strong>.</p>
//         <p>You can now log back into WorkMitra and continue your work without any restrictions.</p>
//         <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background:#f97316;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Log In Now</a></p>
//       </div>
//     `,
//   });
// };

// module.exports = {
//   sendEmail,
//   sendPasswordResetEmail,
//   sendVerificationOtpEmail,
//   sendBanAppealEmailToAdmin,
//   sendBanNotificationEmail,
//   sendUnbanNotificationEmail
// };
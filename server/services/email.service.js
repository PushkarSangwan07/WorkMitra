// A mock email service that skips real delivery and prints codes/links to the console

const sendEmail = async ({ to, subject, html }) => {
  console.log('\n──────────────────────────────────────────');
  console.log(`📧 [MOCK EMAIL SERVICE] Email Skipped/Simulated`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  
  // Extract any URL or OTP from the HTML so you can copy it easily from logs
  const urlMatch = html.match(/href="(https?:\/\/[^"]+)"/);
  const otpMatch = html.match(/<strong[^>]*>([\d]{6})<\/strong>/);
  
  if (urlMatch) {
    console.log(`\n🔗 RESET LINK (Copy & paste into browser):\n    ${urlMatch[1]}`);
  }
  if (otpMatch) {
    console.log(`\n🔑 OTP CODE:\n    ${otpMatch[1]}`);
  }
  console.log('──────────────────────────────────────────\n');
  
  // Return success so the controller thinks the email went through
  return { success: true };
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  await sendEmail({
    to,
    subject: 'Reset your WorkMitra password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your WorkMitra account. This link expires in 15 minutes.</p>
        <p><a href="${resetUrl}" style="background:#1e9e58;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendVerificationOtpEmail = async (to, name, otpCode) => {
  await sendEmail({
    to,
    subject: 'Verify your WorkMitra Account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
        <h2>Welcome to WorkMitra, ${name}!</h2>
        <p>Your verification code is: <strong style="font-size: 24px; color: #f97316; letter-spacing: 2px;">${otpCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendBanAppealEmailToAdmin = async (worker, message) => {
  await sendEmail({
    to: 'admin@workmitra.com',
    subject: `🚨 Urgent: Ban Appeal from ${worker.name}`,
    html: `<p>Ban appeal from ${worker.email}: ${message}</p>`,
  });
};

const sendBanNotificationEmail = async (email, name, reason) => {
  await sendEmail({
    to: email,
    subject: '⚠️ Important: Your WorkMitra Account Has Been Suspended',
    html: `<p>Suspended for: ${reason}</p>`,
  });
};

const sendUnbanNotificationEmail = async (to, name) => {
  await sendEmail({
    to,
    subject: 'Your WorkMitra Account has been Restored 🎉',
    html: `<p>Account restored.</p>`,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
  sendBanAppealEmailToAdmin,
  sendBanNotificationEmail,
  sendUnbanNotificationEmail
};
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(() => {});

const sendResetEmail = async (to, resetUrl) => {
  const mailOptions = {
    from: `"InvestDaily" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">InvestDaily Password Reset</h2>
        <p style="color: #4b5563;">
          You requested a password reset. Click the button below to set a new password. This link is valid for <strong>10 minutes</strong>.
        </p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(to right, #4f46e5, #5b21b6);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin: 20px 0;
          "
        >
          Reset Password
        </a>
        <p style="color: #4b5563;">
          If you didn’t request this, please ignore this email.
        </p>
        <p style="color: #4b5563;">— The InvestDaily Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = { sendResetEmail };

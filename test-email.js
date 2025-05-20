
const nodemailer = require("nodemailer");

async function testEmail() {
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "info@rv2class.com",
      pass: process.env.SMTP_PASS || "v7KkyhVtTTpn"
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log("Connection successful");

    // Try sending test email
    let info = await transporter.sendMail({
      from: "Website Contact <info@rv2class.com>",
      to: "info@rv2class.com", 
      subject: "Test Email",
      text: "This is a test email to verify SMTP functionality"
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error:", error);
  }
}

testEmail();

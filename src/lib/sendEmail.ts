import nodemailer from 'nodemailer';

const sendEmail = async (options: { email: string; subject: string; message: string }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `${process.env.EMAIL_FROM_NAME || 'HisaabWise'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Optional if we want to send HTML emails later
    };

    await transporter.sendMail(message);
};

export default sendEmail;

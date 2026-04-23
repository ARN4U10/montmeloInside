import "dotenv/config";
import nodemailer from "nodemailer";

const getCreds = () => {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  console.log("MAILER USER =", user);
  console.log("MAILER PASS EXISTS =", !!pass);
  console.log("MAILER PASS LENGTH =", pass.length);

  if (!user || !pass) {
    throw new Error("Falten EMAIL_USER o EMAIL_APP_PASSWORD al .env");
  }

  return { user, pass };
};

const getTransporter = () => {
  const { user, pass } = getCreds();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
};

export const verificarMailer = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("SMTP OK");
  } catch (error) {
    console.error("SMTP ERROR:", error);
  }
};

export const enviarCodiRecuperacio = async (correu, codi) => {
  const transporter = getTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: correu,
    subject: "Recuperació de contrasenya - MontmeloInside",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <h2>Recuperació de contrasenya</h2>
        <p>Hem rebut una sol·licitud per recuperar la teva contrasenya.</p>
        <p>El teu codi de verificació és:</p>
        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          color: #d10000;
          margin: 20px 0;
        ">
          ${codi}
        </div>
        <p>Aquest codi caduca en 10 minuts.</p>
        <p>Si tu no has demanat aquest canvi, pots ignorar aquest correu.</p>
      </div>
    `,
  });
};
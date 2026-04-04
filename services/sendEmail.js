"use server";
import { createTransport } from "nodemailer";

const private_email = "ic.recicle.usp@gmail.com";
const private_password = "eknb pgce elgv yahq";

const Transporter = createTransport({
  service: "gmail",
  auth: {
    user: private_email,
    pass: private_password,
  },
  debug: false,
  logger: true,
});

export async function sendEmail(email, subject, html) {
  console.log("Enviando e-mail para 1: " + email);
  return new Promise(async (resolve, reject) => {
    try {
      const mailOptions = {
        from: private_email,
        to: email,
        subject: subject,
        html: html,
      };

      const info = await Transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
      return "Email enviado";
    } catch (error) {
      console.error("Erro ao enviar o e-mail:", error);
      throw error; // Lança o erro para ser tratado em um nível superior
    }
  });
}

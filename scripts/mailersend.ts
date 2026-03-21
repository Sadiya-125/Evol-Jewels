import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY!,
    });

    const sentFrom = new Sender(
      "test@test-z0vklo6v9ppl7qrx.mlsender.net",
      "Evol Jewels",
    );

    const recipients = [
      new Recipient("adibasadiya9502@gmail.com", "Test User"),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("MailerSend Working ✅")
      .setHtml("<h2>If you see this → MailerSend is working 🎉</h2>")
      .setText("MailerSend working");

    const response = await mailerSend.email.send(emailParams);

    console.log("Email Sent Successfully");
    console.log(response);
  } catch (err) {
    console.error("Email Failed");
    console.error(err);
  }
}

main();

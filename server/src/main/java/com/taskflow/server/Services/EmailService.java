package com.taskflow.server.Services;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();

        // Use MimeMessageHelper to set HTML content
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // Set "true" for HTML content
        mailSender.send(message);
    }

    public String generateVerificationEmail(String code) {
        // Create individual character boxes for the code
        StringBuilder codeBoxes = new StringBuilder();
        for (char c : code.toCharArray()) {
            codeBoxes.append(String.format(
                    "<div style=\"display: inline-block; width: 40px; height: 50px; margin: 0 4px; background-color: #f0ebff; border: 1px solid #6049e7; border-radius: 4px; font-size: 28px; font-weight: bold; line-height: 50px; color: #6049e7;\">%s</div>",
                    c));
        }

        StringBuilder content = new StringBuilder(
                """
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                            <title>Vérification d'email</title>
                        </head>
                        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 20px; color: #333333;">
                          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="text-align: center; margin-bottom: 30px;">
                              <h2 style="color: #6049e7; margin: 0; font-weight: 600; font-size: 24px;">Vérification de votre email</h2>
                            </div>

                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Bonjour,</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Tu as reçu cet email pour la réinitialisation de ton mot de passe. Ce code est valide pour <span style="font-weight: bold; color: #e74c3c;">10 minutes</span> seulement.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Si ce n'est pas toi, ne partage pas ce code avec qui que ce soit.</p>

                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                              <p style="margin-top: 0; margin-bottom: 15px; font-weight: 600; font-size: 16px; color: #2c3e50;">Ton code de vérification :</p>

                              <!-- Individual character boxes -->
                              <div style="margin: 30px 0; text-align: center;">
                                %s
                              </div>

                              <!-- Also include the code as plain text for easy copying -->
                              <p style="font-size: 16px; margin-top: 20px;">Code: <span style="font-weight: bold; color: #6049e7; letter-spacing: 2px;">%s</span></p>
                            </div>

                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e4e8; text-align: center; color: #7f8c8d; font-size: 14px;">
                              <p>Ce code expirera dans 10 minutes. Si tu n'as pas demandé cette vérification, tu peux ignorer cet email.</p>
                              <p style="margin-top: 20px;">Cordialement,</p>
                            </div>
                          </div>
                          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #95a5a6;">
                            <p>© 2024. Tous droits réservés.</p>
                          </div>
                        </body>
                        </html>
                        """
                        .formatted(codeBoxes.toString(), code));

        return content.toString();
    }
}

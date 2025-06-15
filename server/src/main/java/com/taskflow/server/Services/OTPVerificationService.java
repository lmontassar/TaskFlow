package com.taskflow.server.Services;

import java.util.Date;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.taskflow.server.Entities.OTPVerification;
import com.taskflow.server.Repositories.OTPVerificationRepository;
@Service
public class OTPVerificationService {
    @Autowired
    private EmailService emailService;

    @Autowired
    private OTPVerificationRepository OTPVrepo;

    public String createCode(String code) {
        return (code.length() == 6) ? code : createCode(code + new Random().nextInt(10));
    }

    public boolean compareWithNow(Date date, int seconds, int c) {
        return c * ((new Date().getTime() - date.getTime()) / 1000) > c * (seconds);
    }

    public int setCode(String email) {
        OTPVerification o = OTPVrepo.findOneByEmail(email);

        if (o != null) {
            if (o.getAttempt() == 0) {
                if (compareWithNow(o.getDate(), 60 * 60, -1)) { // 1 hour

                    return 1; // Vous ne pouvez pas renvoyer le code avant 1 heure.
                } else {
                    String cod = createCode("");
                    OTPVrepo.updateOTPVerification(o.getId(), 5, cod, new Date());
                    try {
                        String htmlContent = emailService.generateVerificationEmail(cod);
                        emailService.sendEmail(email, "Email Verification", htmlContent);
                        // emailService.sendEmail(email, "Email Verification", "Votre code de
                        // vérification : :" + cod);
                    } catch (Exception e) {
                        return 2; // Une erreur est survenue ! Vérifiez votre e-mail.
                    }
                    return 0;
                }
            }
            if (compareWithNow(o.getDate(), 60, 1)) {
                String cod = createCode("");
                OTPVrepo.updateOTPVerification(o.getId(), o.getAttempt(), cod, new Date());
                try {
                    String htmlContent = emailService.generateVerificationEmail(cod);
                    emailService.sendEmail(email, "Email Verification", htmlContent);
                    // emailService.sendEmail(email, "Email Verification", "Votre code de
                    // vérification : :" + cod);
                } catch (Exception e) {

                    return 2; // Une erreur est survenue ! Vérifiez votre e-mail;
                }
                return 0;
            } else {
                return 3; // Vous ne pouvez pas renvoyer le code avant 60 secondes.
            }
        }

        OTPVerification otp = new OTPVerification();
        otp.setAttempt(5);
        otp.setEmail(email);
        otp.setDate(new Date());
        otp.setCode(createCode(""));
        OTPVrepo.save(otp);
        try {
            String htmlContent = emailService.generateVerificationEmail(otp.getCode());
            emailService.sendEmail(email, "Email Verification", htmlContent);
            //emailService.sendEmail(email, "Email Verification", "Votre code de vérification :  :" + otp.getCode());
        } catch (Exception e) {
            return 2; // Une erreur est survenue ! Vérifiez votre e-mail."
        }
        return 0;
    }

    public int verify(String email, String code) {
        OTPVerification o = OTPVrepo.findOneByEmail(email);
        if (o == null)
            return 0;
        if (o.getAttempt() == 0) {
            if (compareWithNow(o.getDate(), 60, -1)) { // 1 hour
                return 2;
                // throw new RuntimeException("Vous ne pouvez pas vérifier le code avant 1
                // heure.");
            } else {
                return 3;
                // throw new RuntimeException("Veuillez essayer de renvoyer le code.");
            }
        }
        if (o.getCode().equals(code) && compareWithNow(o.getDate(), 60 * 10, -1) /* 10 minutes */ )
            return 1;
        else
            OTPVrepo.updateOTPVerification(o.getId(), o.getAttempt() - 1, o.getCode(), o.getDate());
        return 0;
    }

    public OTPVerification findOneByEmail(String email) {
        return OTPVrepo.findOneByEmail(email);
    }
}

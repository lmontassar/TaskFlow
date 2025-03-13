package com.taskflow.server.Services;

import com.taskflow.server.Entities.LoginSecurity;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.LoginSecurityRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

import java.util.Date;
import java.util.Optional;
@Service
public class LoginSecurityService {
    @Autowired
    private LoginSecurityRepository loginSecurityRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserService userService;
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_THRESHOLD = 15; // Lock time in minutes

    public void checkAttempt(String email) throws MessagingException {
        Optional<LoginSecurity> optionalLoginSecurity = loginSecurityRepository.findByEmail(email);
        Date now = new Date();

        if (optionalLoginSecurity.isPresent()) {
            LoginSecurity ls = optionalLoginSecurity.get();
            int currentAttempts = ls.getLoginAttempt();
            Date lastAttemptDate = ls.getLoginAttemptDate();

            if (lastAttemptDate != null) {
                long diffInMillies = now.getTime() - lastAttemptDate.getTime();
                long diffInMinutes = TimeUnit.MILLISECONDS.toMinutes(diffInMillies);
                
                if (diffInMinutes > LOCK_TIME_THRESHOLD) {
                    currentAttempts = 0;
                }
            }

            currentAttempts++;
            ls.setLoginAttempt(currentAttempts);
            ls.setLoginAttemptDate(now);
            loginSecurityRepository.save(ls);

            if (currentAttempts >= MAX_ATTEMPTS) {
                emailService.sendEmail(
                        email,
                        "⚠️ Security Alert: Unsuccessful Login Attempt",
                        "Dear user,\n\n" +
                                "We noticed an unsuccessful login attempt to your account.\n" +
                                "If this was you, please ensure you are entering the correct credentials.\n" +
                                "If this was not you, we recommend resetting your password immediately to secure your account.\n\n" +
                                "Best regards,\nTaskFlow Security Team"
                );
                ls.setLoginAttempt(0);
                ls.setLoginAttemptDate(now);
                loginSecurityRepository.save(ls);
            }

        } else {
            LoginSecurity newLoginSecurity = new LoginSecurity();
            newLoginSecurity.setEmail(email);
            newLoginSecurity.setLoginAttempt(1);
            newLoginSecurity.setLoginAttemptDate(now);
            loginSecurityRepository.save(newLoginSecurity);
        }
    }

    public void resetAttempts(String email) {
        Optional<LoginSecurity> optionalLoginSecurity = loginSecurityRepository.findByEmail(email);
        optionalLoginSecurity.ifPresent(ls -> {
            ls.setLoginAttempt(0);
            ls.setLoginAttemptDate(null);
            loginSecurityRepository.save(ls);
        });
    }
}

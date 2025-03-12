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

                System.out.println("Time since last failed attempt: " + diffInMinutes + " minutes");

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
                        "Account Locked Due to Too Many Failed Login Attempts",
                        "Your account has been temporarily locked due to multiple failed login attempts. Please try again later or reset your password."
                );
                userService.lockAccount(email);

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

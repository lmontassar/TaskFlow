package com.taskflow.server.Services;

import com.taskflow.server.Entities.LoginSecurity;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.LoginSecurityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
@Service
public class LoginSecurityService {
    private static final int MAX_ATTEMPTS = 5; // Maximum failed attempts before lockout
    private static final long LOCK_TIME_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

    @Autowired
    private LoginSecurityRepository loginSecurityRepository;

    public Boolean checkAttempt(User email) {
        Optional<LoginSecurity> optionalLoginSecurity = loginSecurityRepository.findByUser(email);

        if (optionalLoginSecurity.isPresent()) {
            LoginSecurity ls = optionalLoginSecurity.get();
            ls.setLoginAttempt(ls.getLoginAttempt() + 1);
            ls.setLoginAttemptDate(new Date());
            loginSecurityRepository.save(ls);
            if (ls.getLoginAttempt() >= MAX_ATTEMPTS) {
                return false;
            }
            return true;
        } else {
            LoginSecurity newLoginSecurity = new LoginSecurity();
            newLoginSecurity.setUser(email);
            newLoginSecurity.setLoginAttempt(1);
            newLoginSecurity.setLoginAttemptDate(new Date());

            loginSecurityRepository.save(newLoginSecurity);
            return true;
        }
    }
}

package com.taskflow.server.Services;

import java.util.Date;
import java.util.Random;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.OTPVerification;
import com.taskflow.server.Repositories.OTPVerificationRepository;

@Service
public class OTPVerificationService {
    @Autowired
    private EmailService emailService;

    @Autowired
    private OTPVerificationRepository OTPVrepo;
    
    public String createCode(String code){
        return (code.length() == 6)  ? code : createCode(code + new Random().nextInt(10) );
    }

    public void setCode(String email) throws RuntimeException{
        OTPVerification o =  OTPVrepo.findOneByEmail(email) ;

        if(o!= null){
            if(o.getAttempt() == 0 ){
                System.out.println(( (new Date().getTime() - o.getDate().getTime())/1000 < (60 )*60 ) );
                if (( (new Date().getTime() - o.getDate().getTime())/1000 < (60 )*60 ) ){  // 1 hour
                    throw new RuntimeException("Vous ne pouvez pas renvoyer le code avant 1 heure.");
                } else {
                    String cod = createCode("");
                    OTPVrepo.updateOTPVerification(o.getId(),5,cod,new Date());
                    try{
                        emailService.sendEmail( email , "Email Verification" ,"Votre code de vérification :  :"+cod );
                    } catch(Exception e){
                        throw new RuntimeException("Une erreur est survenue ! Vérifiez votre e-mail.");
                    }
                    return;
                }
            }
            if ( ( (new Date().getTime() - o.getDate().getTime())/1000 > (60 ) )) {
                String cod = createCode("");
                OTPVrepo.updateOTPVerification(o.getId(),o.getAttempt(),cod ,new Date());
                try{
                    emailService.sendEmail( email , "Email Verification" ,"Votre code de vérification :  :"+cod );
                } catch(Exception e){
                    throw new RuntimeException("Une erreur est survenue ! Vérifiez votre e-mail.");
                }
                return;
            } else {
                throw new RuntimeException("Vous ne pouvez pas renvoyer le code avant 60 secondes.");
            }
        }
        
        OTPVerification otp = new OTPVerification();
        otp.setAttempt(5);
        otp.setEmail(email);
        otp.setDate(new Date());
        otp.setCode( createCode("") );
        OTPVrepo.save(otp);
        try{
            emailService.sendEmail( email , "Email Verification" ,"Votre code de vérification :  :"+otp.getCode() );
        } catch(Exception e){
            throw new RuntimeException("Une erreur est survenue ! Vérifiez votre e-mail.");
        }
    }

    public boolean verify(String email,String code){
        OTPVerification o =  OTPVrepo.findOneByEmail(email);
        if (o== null) return false;
        if(o.getAttempt() == 0 ){
            if (( (new Date().getTime() - o.getDate().getTime())/1000 < (60 )*60 ) ){  // 1 hour
                throw new RuntimeException("Vous ne pouvez pas vérifier le code avant 1 heure.");
            } else {
                throw new RuntimeException("Veuillez essayer de renvoyer le code.");
            }

        }
        
        if( o.getCode().equals(code) && ( ( new Date().getTime() - o.getDate().getTime() ) / 1000 < ( 60*10 )  /*10 minutes*/ )) 
            return true;
        else OTPVrepo.updateOTPVerification(o.getId(),o.getAttempt()-1,o.getCode(),o.getDate());


        return false;
    }

    public OTPVerification findOneByEmail(String email){
        return OTPVrepo.findOneByEmail(email);
    }
}

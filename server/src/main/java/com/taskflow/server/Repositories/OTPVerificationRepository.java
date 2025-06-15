package com.taskflow.server.Repositories;
import java.util.Date;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;
import com.taskflow.server.Entities.OTPVerification;

@Repository
public interface OTPVerificationRepository extends MongoRepository<OTPVerification,String>{
    public OTPVerification findOneByEmail(String email);
    @Query("{ '_id': ?0 }")
    @Update("{ '$set': { 'attempt': ?1,'code': ?2,'date':?3} }")
    public void updateOTPVerification(String id, int attempts,String code,Date date);
}

package com.taskflow.server.Services;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.*;
import com.taskflow.server.Repositories.ProjectRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.taskflow.server.Repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWT myJWT;

    @Autowired
    private ProjectRepository projectRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private User changeRole(String userId, User.Role role){
        User user = findById(userId);
        if(user==null){
            return null;
        }
        user.setRole(role);
        return userRepository.save(user);
    }


    public User findOrCreateUser(User u) {
        User existingUser = userRepository.findByEmail(u.getEmail()).orElse(null);
        if (existingUser != null) {
            return existingUser;
        } else {
            u.setActivation(Boolean.TRUE);
            return userRepository.save(u);
        }
    }
    public List<User> getAll(){
        return userRepository.findAll();
    }
    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return null;
        }

        if (!user.getPhoneNumber().equals(""))
            if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
                return null;
            }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateById(String id, User upUser) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null)
            return null;
        BeanUtils.copyProperties(upUser, u, getNullPropertyNames(upUser));
        return userRepository.save(u);
    }

    public void resetPassword(User u, String password) {
        password = passwordEncoder.encode(password);
        userRepository.updatePasswordById(u.getId(), password);
    }

    private String[] getNullPropertyNames(Object source) {
        return Arrays.stream(BeanUtils.getPropertyDescriptors(source.getClass()))
                .map(pd -> pd.getName())
                .filter(name -> {
                    try {
                        return BeanUtils.getPropertyDescriptor(source.getClass(), name).getReadMethod()
                                .invoke(source) == null;
                    } catch (Exception e) {
                        return false;
                    }
                }).toArray(String[]::new);
    }

    public void setActivation(User u, boolean b) {
        userRepository.updateActivationById(u.getId(), b);
    }

    public User findById(String id) {
        User u = userRepository.getUserById(id);
        if (u != null) {
            u.setPassword(null);
        }
        return u;
    }

    public Boolean isCollaborator(User u, Project p) {
        for (Collaborator members : p.getListeCollaborateur()) {
            if (u.equals(members.getUser())) {
                return true;
            }
        }
        return false;
    }

    public List<Project> getAllMyProjects(String userId) {
        return projectRepository.findAll().stream()
                .filter(project -> {
                    boolean isCollaborator = project.getListeCollaborateur().stream()
                            .anyMatch(collaborator -> collaborator.getUser() != null &&
                                    userId.equals(collaborator.getUser().getId()));

                    boolean isCreator = project.getCreateur() != null &&
                            project.getCreateur().getId() != null &&
                            userId.equals(project.getCreateur().getId());

                    return (isCollaborator || isCreator);
        }).collect(Collectors.toList());
    }

    public Boolean isAvailable(User user, Project project) {
        if (user == null || project == null)
            return false;

        List<Project> userProjects = getAllMyProjects(user.getId());
        Date newStart = project.getDateDebut();
        Date newEnd = project.getDateFinEstime();

        for (Project existingProject : userProjects) {
            if (Objects.equals(project.getId(), existingProject.getId()))
                continue;

            Date existingStart = existingProject.getDateDebut();
            Date existingEnd = existingProject.getDateFinEstime();

            // Check if the new project overlaps with any existing ones
            boolean overlaps = newStart.before(existingEnd) && newEnd.after(existingStart);
            if (overlaps)
                return false;
        }

        return true;
    }

    public List<SearchResponce> search(String query, String projectId) {
        Project project = projectRepository.getProjectById(projectId);
        if (project == null)
            return new ArrayList<>(); // Avoid null pointer

        List<User> userList = userRepository.findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        List<SearchResponce> resultList = new ArrayList<>();

        for (User user : userList) {
            SearchResponce response = new SearchResponce();
            response.setId(user.getId());
            response.setPrenom(user.getPrenom());
            response.setAvatar(user.getAvatar());
            response.setNom(user.getNom());
            response.setEmail(user.getEmail());
            response.setTitle(user.getTitle());
            response.setIsAvailable(isAvailable(user, project));

            resultList.add(response);
        }

        return resultList;
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public User getUserFromToken(String token) {
        String id = myJWT.extractUserId(token);
        return findById(id);
    }
    public void changeOnline(String userID,Boolean online){
        User user = findById(userID);
        if(user!=null){
            user.setOnline(online);
            if(!online){
                user.setLastOnline(LocalDateTime.now());
            }
            userRepository.save(user);
        }
    }

    public void changeBlocked(String userId,boolean block){
        User user = findById(userId);
        if(user!=null){
            user.setBlocked(block);
            userRepository.save(user);
        }
    }
}

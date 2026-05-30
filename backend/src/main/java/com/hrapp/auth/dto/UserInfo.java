package com.hrapp.auth.dto;

import com.hrapp.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserInfo {

    private final UUID id;
    private final String email;
    private final String role;
    private final UUID companyId;

    public static UserInfo from(User user) {
        return new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getCompany().getId()
        );
    }
}

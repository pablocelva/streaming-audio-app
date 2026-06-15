package com.streamingethico.modules.user.api;

import com.streamingethico.modules.user.application.UserService;

import com.streamingethico.shared.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserService.UserProfileResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getProfile(principal.getId());
    }
}

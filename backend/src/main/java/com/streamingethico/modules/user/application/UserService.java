package com.streamingethico.modules.user.application;

import com.streamingethico.modules.user.domain.Subscription;
import com.streamingethico.modules.user.domain.User;
import com.streamingethico.modules.user.infrastructure.SubscriptionRepository;
import com.streamingethico.modules.user.infrastructure.UserRepository;

import com.streamingethico.shared.security.UserPrincipal;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.shared.domain.RoleName;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    public UserService(UserRepository userRepository, SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Usuario no encontrado"));

        Subscription subscription = subscriptionRepository.findByUserId(userId).orElse(null);

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getNombre().name())
                .toList();

        SubscriptionResponse subscriptionResponse = subscription == null ? null :
                new SubscriptionResponse(
                        subscription.getPlan().name(),
                        subscription.getEstado().name(),
                        subscription.getExpiresAt()
                );

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                roles,
                subscriptionResponse
        );
    }

    public record UserProfileResponse(
            UUID id,
            String email,
            String fullName,
            List<String> roles,
            SubscriptionResponse subscription
    ) {}

    public record SubscriptionResponse(
            String plan,
            String status,
            java.time.Instant expiresAt
    ) {}
}

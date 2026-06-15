package com.streamingethico.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Storage storage,
        Royalties royalties,
        Upload upload
) {
    public record Jwt(String secret, int accessExpirationMinutes, int refreshExpirationDays) {}
    public record Storage(
            String endpoint,
            String accessKey,
            String secretKey,
            String bucket,
            String region,
            int presignedUrlExpirationMinutes
    ) {}
    public record Royalties(double premiumWeight, double freeWeight, double artistCapPercentage) {}
    public record Upload(long maxFileSizeBytes) {}
}

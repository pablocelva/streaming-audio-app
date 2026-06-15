package com.streamingethico.shared.config;

import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient(AppProperties appProperties) {
        AppProperties.Storage storage = appProperties.storage();
        return MinioClient.builder()
                .endpoint(storage.endpoint())
                .credentials(storage.accessKey(), storage.secretKey())
                .build();
    }
}

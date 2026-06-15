package com.streamingethico;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Path;

@SpringBootApplication
public class StreamingAudioApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(StreamingAudioApplication.class, args);
    }

    private static void loadEnvFile() {
        Path backendDir = Path.of(System.getProperty("user.dir"));
        Path projectRoot = backendDir.getFileName().toString().equals("backend")
                ? backendDir.getParent()
                : backendDir;

        Dotenv dotenv = Dotenv.configure()
                .directory(projectRoot.toString())
                .filename(".env")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}

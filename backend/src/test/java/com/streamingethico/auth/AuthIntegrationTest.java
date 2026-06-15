package com.streamingethico.auth;

import com.streamingethico.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends IntegrationTestBase {

    @Test
    void registerLoginAndAccessProtectedEndpoint() throws Exception {
        String email = "listener-" + System.nanoTime() + "@test.com";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "password123",
                                  "fullName": "Test Listener"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "password123"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        String body = loginResult.getResponse().getContentAsString();
        String token = body.replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        assertThat(body).contains("refreshToken");
    }

    @Test
    void catalogFeaturedIsPublic() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/featured"))
                .andExpect(status().isOk());
    }
}

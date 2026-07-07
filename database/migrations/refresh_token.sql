-- creating refresh token 

CREATE TABLE refresh_tokens(

token_id BIGINT AUTO_INCREMENT PRIMARY KEY,

user_id BIGINT NOT NULL,

token_hash VARCHAR(255) NOT NULL,

expires_at DATETIME NOT NULL,

is_revoked BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY(user_id)

REFERENCES users(user_id)

);
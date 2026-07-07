-- creating audit logs table

CREATE TABLE audit_logs (

    audit_log_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NULL,

    action VARCHAR(100) NOT NULL,

    module VARCHAR(100) NOT NULL,

    description TEXT,

    ip_address VARCHAR(50),

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)
);
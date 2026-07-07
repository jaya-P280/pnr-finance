-- creating audit logs table

CREATE TABLE audit_logs(

audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,

user_id BIGINT,

module_name VARCHAR(100),

action VARCHAR(100),

record_id BIGINT,

ip_address VARCHAR(50),

user_agent TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY(user_id)

REFERENCES users(user_id)

);
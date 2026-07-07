
-- ROLES TABLE IS CREATED

Create Table roles(
role_id Bigint Auto_increment Primary Key,
role_name VARCHAR(100) NOT NULL UNIQUE,
role_description VARCHAR(255),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 

-- default roles in system

INSERT INTO roles
(role_name,role_description)
VALUES
('SUPER_ADMIN','Complete System Access'),
('BRANCH_MANAGER','Manage Branch'),
('FIELD_OFFICER','Customer Operations'),
('ACCOUNTANT','Finance Operations');
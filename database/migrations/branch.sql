-- creating branch table 
use pnrg_finance;
CREATE TABLE branches(

branch_id BIGINT PRIMARY KEY AUTO_INCREMENT,

branch_code VARCHAR(20) UNIQUE,

branch_name VARCHAR(100),

phone VARCHAR(20),

email VARCHAR(100),

address TEXT,

city VARCHAR(100),

state VARCHAR(100),

pincode VARCHAR(10),

status ENUM('ACTIVE','INACTIVE')

DEFAULT 'ACTIVE',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP NULL DEFAULT NULL

);
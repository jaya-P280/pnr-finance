use pnrg_finance;

CREATE TABLE customers (

    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_code VARCHAR(30) NOT NULL UNIQUE,

    branch_id BIGINT NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    gender ENUM('MALE','FEMALE','OTHER') NOT NULL,

    date_of_birth DATE NOT NULL,

    mobile_number VARCHAR(20) NOT NULL UNIQUE,

    alternate_mobile VARCHAR(20),

    email VARCHAR(150) UNIQUE,

    aadhaar_number VARCHAR(20) UNIQUE,

    pan_number VARCHAR(20) UNIQUE,

    occupation VARCHAR(100),

    monthly_income DECIMAL(12,2),

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE',
        'BLACKLISTED'
    ) DEFAULT 'ACTIVE',

    created_by BIGINT NOT NULL,

    updated_by BIGINT,

    deleted_by BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_customer_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)

);
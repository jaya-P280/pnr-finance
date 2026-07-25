use pnrg_finance;

CREATE TABLE customer_kyc (

    customer_kyc_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    aadhaar_number VARCHAR(12),

    pan_number VARCHAR(10),

    aadhaar_front VARCHAR(255),

    aadhaar_back VARCHAR(255),

    pan_image VARCHAR(255),

    kyc_status ENUM(
        'PENDING',
        'VERIFIED',
        'REJECTED'
    ) DEFAULT 'PENDING',

    verified_by BIGINT,

    verified_at TIMESTAMP NULL,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id),

    FOREIGN KEY(verified_by)
        REFERENCES users(user_id)

);

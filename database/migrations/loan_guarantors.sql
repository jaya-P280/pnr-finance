CREATE TABLE loan_guarantors (

    guarantor_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    loan_id BIGINT NOT NULL,

    guarantor_name VARCHAR(150) NOT NULL,

    relation VARCHAR(100),

    mobile VARCHAR(20),

    address TEXT,

    aadhaar_number VARCHAR(20),

    pan_number VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(loan_id)
        REFERENCES loans(loan_id)
        ON DELETE CASCADE

);
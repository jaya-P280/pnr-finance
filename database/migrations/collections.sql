CREATE TABLE collections (

    collection_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    receipt_number VARCHAR(30) UNIQUE NOT NULL,

    loan_id BIGINT NOT NULL,

    repayment_schedule_id BIGINT NOT NULL,

    customer_id BIGINT NOT NULL,

    collected_by BIGINT NOT NULL,

    collection_date DATE NOT NULL,

    collection_mode ENUM(
        'CASH',
        'BANK_TRANSFER',
        'ONLINE',
        'UPI'
    ) DEFAULT 'CASH',

    principal_collected DECIMAL(12,2) DEFAULT 0,

    interest_collected DECIMAL(12,2) DEFAULT 0,

    penalty_collected DECIMAL(12,2) DEFAULT 0,

    total_collected DECIMAL(12,2) NOT NULL,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(loan_id)
        REFERENCES loans(loan_id),

    FOREIGN KEY(repayment_schedule_id)
        REFERENCES repayment_schedules(repayment_schedule_id),

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id),

    FOREIGN KEY(collected_by)
        REFERENCES users(user_id)

);
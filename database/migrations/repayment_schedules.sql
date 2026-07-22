CREATE TABLE repayment_schedules (

    repayment_schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    loan_id BIGINT NOT NULL,

    installment_number INT NOT NULL,

    due_date DATE NOT NULL,

    principal_amount DECIMAL(12,2) NOT NULL,

    interest_amount DECIMAL(12,2) NOT NULL,

    installment_amount DECIMAL(12,2) NOT NULL,

    paid_amount DECIMAL(12,2) DEFAULT 0,

    balance_amount DECIMAL(12,2) NOT NULL,

    paid_date DATE,

    status ENUM(
        'PENDING',
        'PARTIAL',
        'PAID',
        'OVERDUE'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(loan_id)
        REFERENCES loans(loan_id)
        ON DELETE CASCADE

);
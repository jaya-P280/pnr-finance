CREATE TABLE loans (

    loan_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    loan_number VARCHAR(30) NOT NULL UNIQUE,

    application_id BIGINT NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,

    branch_id BIGINT NOT NULL,

    group_id BIGINT NULL,

    loan_product_id BIGINT NOT NULL,

    principal_amount DECIMAL(12,2) NOT NULL,

    disbursed_amount DECIMAL(12,2) NOT NULL,

    interest_rate DECIMAL(5,2) NOT NULL,

    total_interest DECIMAL(12,2) NOT NULL,

    total_payable DECIMAL(12,2) NOT NULL,

    outstanding_amount DECIMAL(12,2) NOT NULL,

    tenure INT NOT NULL,

    recovery_frequency ENUM(
        'DAILY',
        'WEEKLY',
        'BI_WEEKLY',
        'MONTHLY'
    ) NOT NULL,

    disbursement_date DATE NOT NULL,

    maturity_date DATE,

    status ENUM(
        'ACTIVE',
        'CLOSED',
        'FORECLOSED',
        'DEFAULTED'
    ) DEFAULT 'ACTIVE',

    remarks TEXT,

    created_by BIGINT,

    updated_by BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(application_id)
        REFERENCES loan_applications(application_id),

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id),

    FOREIGN KEY(branch_id)
        REFERENCES branches(branch_id),

    FOREIGN KEY(group_id)
        REFERENCES customer_groups(group_id),

    FOREIGN KEY(loan_product_id)
        REFERENCES loan_products(loan_product_id),

    FOREIGN KEY(created_by)
        REFERENCES users(user_id),

    FOREIGN KEY(updated_by)
        REFERENCES users(user_id)

);
USE pnrg_finance;

CREATE TABLE loan_applications (

    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    application_number VARCHAR(30) NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,

    group_id BIGINT NULL,

    loan_product_id BIGINT NOT NULL,

    requested_amount DECIMAL(12,2) NOT NULL,

    approved_amount DECIMAL(12,2),

    tenure INT NOT NULL,

    interest_rate DECIMAL(5,2) NOT NULL,

    purpose VARCHAR(255),

    remarks TEXT,

    application_status ENUM(

        'DRAFT',

        'PENDING',

        'UNDER_REVIEW',

        'VERIFIED',

        'APPROVED',

        'REJECTED',

        'DISBURSED'

    ) DEFAULT 'PENDING',

    rejection_reason TEXT,

    applied_by BIGINT NOT NULL,

    approved_by BIGINT,

    verified_by BIGINT,

    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_at TIMESTAMP NULL,

    verified_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_application_customer
    FOREIGN KEY(customer_id)
    REFERENCES customers(customer_id),

    CONSTRAINT fk_application_group
    FOREIGN KEY(group_id)
    REFERENCES customer_groups(group_id)
    ON DELETE SET NULL,

    CONSTRAINT fk_application_product
    FOREIGN KEY(loan_product_id)
    REFERENCES loan_products(loan_product_id),

    CONSTRAINT fk_application_applied_by
    FOREIGN KEY(applied_by)
    REFERENCES users(user_id),

    CONSTRAINT fk_application_verified_by
    FOREIGN KEY(verified_by)
    REFERENCES users(user_id),

    CONSTRAINT fk_application_approved_by
    FOREIGN KEY(approved_by)
    REFERENCES users(user_id)

);
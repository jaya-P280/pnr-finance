CREATE TABLE loan_products (

    loan_product_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    product_code VARCHAR(20) NOT NULL UNIQUE,

    product_name VARCHAR(150) NOT NULL,

    product_type ENUM(
        'INDIVIDUAL',
        'GROUP'
    ) DEFAULT 'INDIVIDUAL',

    interest_type ENUM(
        'FLAT',
        'REDUCING'
    ) DEFAULT 'FLAT',

    recovery_frequency ENUM(
        'DAILY',
        'WEEKLY',
        'BI_WEEKLY',
        'MONTHLY',
        'YEARLY',
        'CUSTOM'
    ) NOT NULL,

    minimum_amount DECIMAL(12,2) NOT NULL,

    maximum_amount DECIMAL(12,2) NOT NULL,

    minimum_tenure INT NOT NULL,

    maximum_tenure INT NOT NULL,

    interest_rate DECIMAL(5,2) NOT NULL,

    processing_fee_type ENUM(
        'FIXED',
        'PERCENTAGE'
    ) DEFAULT 'PERCENTAGE',

    processing_fee DECIMAL(10,2) DEFAULT 0,

    insurance_fee_type ENUM(
        'FIXED',
        'PERCENTAGE'
    ) DEFAULT 'FIXED',

    insurance_fee DECIMAL(10,2) DEFAULT 0,

    penalty_type ENUM(
        'FIXED',
        'PERCENTAGE'
    ) DEFAULT 'FIXED',

    penalty DECIMAL(10,2) DEFAULT 0,

    holiday_excluded BOOLEAN DEFAULT TRUE,

    include_gst BOOLEAN DEFAULT FALSE,

    description TEXT,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_by BIGINT,

    updated_by BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    FOREIGN KEY(created_by)
        REFERENCES users(user_id),

    FOREIGN KEY(updated_by)
        REFERENCES users(user_id)

);
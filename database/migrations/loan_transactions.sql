CREATE TABLE loan_transactions (

    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    loan_id BIGINT NOT NULL,

    collection_id BIGINT,

    transaction_type ENUM(
        'DISBURSEMENT',
        'COLLECTION',
        'PENALTY',
        'WAIVER',
        'FORECLOSURE'
    ) NOT NULL,

    transaction_amount DECIMAL(12,2) NOT NULL,

    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    created_by BIGINT,

    FOREIGN KEY(loan_id)
        REFERENCES loans(loan_id),

    FOREIGN KEY(collection_id)
        REFERENCES collections(collection_id),

    FOREIGN KEY(created_by)
        REFERENCES users(user_id)

);
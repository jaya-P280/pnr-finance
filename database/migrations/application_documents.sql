USE pnrg_finance;

CREATE TABLE application_documents(

    application_document_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    application_id BIGINT NOT NULL,

    document_type ENUM(

        'AADHAAR',

        'PAN',

        'PHOTO',

        'ADDRESS_PROOF',

        'INCOME_PROOF',

        'BANK_PASSBOOK',

        'PROPERTY_DOCUMENT',

        'OTHER'

    ) NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    file_path VARCHAR(500) NOT NULL,

    remarks VARCHAR(255),

    uploaded_by BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_application
    FOREIGN KEY(application_id)
    REFERENCES loan_applications(application_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_document_uploaded_by
    FOREIGN KEY(uploaded_by)
    REFERENCES users(user_id)

);
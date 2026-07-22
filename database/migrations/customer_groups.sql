CREATE TABLE customer_groups (

    group_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    group_code VARCHAR(20) NOT NULL UNIQUE,

    group_name VARCHAR(150) NOT NULL,

    branch_id BIGINT NOT NULL,

    leader_customer_id BIGINT NULL,

    center_name VARCHAR(150),

    meeting_day ENUM(
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
    ),

    meeting_time TIME,

    address TEXT,

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

    CONSTRAINT fk_group_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id),

    CONSTRAINT fk_group_leader
        FOREIGN KEY (leader_customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_group_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    CONSTRAINT fk_group_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)

);
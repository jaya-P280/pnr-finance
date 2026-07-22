CREATE TABLE group_members (

    group_member_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    group_id BIGINT NOT NULL,

    customer_id BIGINT NOT NULL,

    joined_at DATE,

    status ENUM(
        'ACTIVE',
        'LEFT'
    ) DEFAULT 'ACTIVE',

    created_by BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_group_customer (
        group_id,
        customer_id
    ),

    CONSTRAINT fk_member_group
        FOREIGN KEY (group_id)
        REFERENCES customer_groups(group_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT fk_member_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)

);
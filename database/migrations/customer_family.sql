CREATE TABLE customer_family (

    family_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    member_name VARCHAR(150),

    relationship VARCHAR(50),

    age INT,

    occupation VARCHAR(100),

    mobile VARCHAR(15),

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)

);

CREATE TABLE customer_nominees (

    nominee_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    nominee_name VARCHAR(150),

    relationship VARCHAR(50),

    dob DATE,

    mobile VARCHAR(15),

    address TEXT,

    percentage DECIMAL(5,2),

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)

);

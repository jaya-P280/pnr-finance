CREATE TABLE customer_addresses (

    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    address_type ENUM(
        'CURRENT',
        'PERMANENT'
    ),

    house_no VARCHAR(50),

    street VARCHAR(150),

    village VARCHAR(150),

    mandal VARCHAR(150),

    district VARCHAR(150),

    state VARCHAR(100),

    pincode VARCHAR(10),

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)

);
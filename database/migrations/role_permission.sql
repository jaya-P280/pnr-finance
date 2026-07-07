-- creating role permissions 

CREATE TABLE role_permissions (
	role_permission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_role_permssion_role
    FOREIGN KEY (role_id)
    REFERENCES roles(role_id),
    
    CONSTRAINT fk_role_permission_permission
    FOREIGN KEY (permission_id)
    REFERENCES permission(permission_id),
    
    UNIQUE(role_id,permission_id)
    
);
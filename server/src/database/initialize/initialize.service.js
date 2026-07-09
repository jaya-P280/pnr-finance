import bcrypt from "bcrypt"
import logger from "../../config/logger.js"
import repository from "./initialize.repository.js"
import {
    DEFAULT_ADMIN,
    DEFAULT_BRANCH,
    DEFAULT_PERMISSIONS,
    DEFAULT_ROLES,
} from "./default.data.js";

class InitializeService{
    async initialize(){
        const connection = await repository.beginTransaction();
        try{
            logger.info("starting database initialization...");
            logger.info("checking default roles...")

            for(const role of DEFAULT_ROLES){
                const existingRole = await repository.findRoleByName(connection,role.role_name);
                if(!existingRole){
                    await repository.createRole(connection,role);
                    logger.info(`Role is created : ${role.role_name}`);
                }else{
                    logger.info(`Role exists: ${role.role_name}`);
                }
            }

            logger.info("checking default permissions...")

            for(const permission of DEFAULT_PERMISSIONS){
                const existingRole = await repository.findPermissionByName(connection,permission.permission_name);
                if(!existingRole){
                    await repository.createRole(connection,permission);
                    logger.info(`Role is created : ${permission.permission_name}`);
                }else{
                    logger.info(`Role exists: ${permission.permission_name}}`);
                }
            }

         logger.info(
                "Assigning permissions to SUPER_ADMIN..."
            );

            const superAdmin =
                await repository.findRoleByName(
                    connection,
                    "SUPER_ADMIN"
                );

            for (const permission of DEFAULT_PERMISSIONS) {

                const permissionRow =
                    await repository.findPermissionByName(
                        connection,
                        permission.permission_name
                    );

                const assigned =
                    await repository.rolePermissionExists(
                        connection,
                        superAdmin.role_id,
                        permissionRow.permission_id
                    );

                if (!assigned) {

                    await repository.assignPermission(
                        connection,
                        superAdmin.role_id,
                        permissionRow.permission_id
                    );

                    logger.info(
                        `Assigned ${permission.permission_name}`
                    );

                }

            }

            /* ====================================================
               BRANCH
            ==================================================== */

            logger.info("Checking Head Office...");

            let branch =
                await repository.findBranch(
                    connection,
                    DEFAULT_BRANCH.branch_code
                );

            let branchId;

            if (!branch) {

                branchId =
                    await repository.createBranch(
                        connection,
                        DEFAULT_BRANCH
                    );

                logger.info("Head Office Created");

            } else {

                branchId = branch.branch_id;

                logger.info("Head Office Exists");

            }

            /* ====================================================
               ADMIN
            ==================================================== */

            logger.info("Checking Super Admin...");

            const existingAdmin =
                await repository.findAdmin(
                    connection,
                    DEFAULT_ADMIN.email
                );

            if (!existingAdmin) {

                const passwordHash =
                    await bcrypt.hash(
                        DEFAULT_ADMIN.password,
                        12
                    );

                await repository.createAdmin(
                    connection,
                    {

                        branch_id: branchId,

                        role_id: superAdmin.role_id,

                        employee_code:
                            DEFAULT_ADMIN.employee_code,

                        first_name:
                            DEFAULT_ADMIN.first_name,

                        last_name:
                            DEFAULT_ADMIN.last_name,

                        email:
                            DEFAULT_ADMIN.email,

                        phone:
                            DEFAULT_ADMIN.phone,

                        password_hash:
                            passwordHash

                    }
                );

                logger.info(
                    "Super Admin Created"
                );

            } else {

                logger.info(
                    "Super Admin Already Exists"
                );

            }

            await repository.commit(connection);

            logger.info(
                "Database initialization completed successfully."
            );

        }

        catch (error) {

            await repository.rollback(connection);

            logger.error(error.stack);

            throw error;

        }

    }

}

export default new InitializeService();
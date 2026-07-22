import bcrypt from "bcrypt";
import crypto from "crypto";
import logger from "../../config/logger.js";
import ApiError from "../../shared/ApiError.js";
import userRepository from "./user.repository.js";
import { EMPLOYEE, USER_MESSAGES } from "./user.constants.js";
import { profile } from "console";
import pool from "../../database/db.js";
import passwordResetService from "../auth/password-reset/password-reset.service.js";
import emailService from "../../shared/email.service.js";
import passwordSetupTemplate from "../../shared/templates/password-setup.template.js";
import path from "path";
import fs from "fs/promises";
import auditService from "../audit/audit.service.js"
import CodeGenerator from "../../shared/codeGenerator.helper.js";

class UserService {
    async createUser(data, createdBy, metadata) {
        const connection = await userRepository.beginTransaction();
        try {
            const emailExists = await userRepository.emailExists(connection, data.email);
            if (emailExists) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.EMAIL_EXISTS
                );
            }

            const phoneExists = await userRepository.phoneExists(connection, data.phone);
            if (phoneExists) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.PHONE_EXISTS
                );
            }

            const role = await userRepository.roleExists(connection, data.roleId);
            if (!role) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.ROLE_NOT_FOUND
                );
            }

            const branch = await userRepository.branchExists(connection, data.branchId);
            if (!branch) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.BRANCH_NOT_FOUND
                );
            }

            const lastEmployee = await userRepository.getLastEmployeeCode(connection);
            const employeeCode = CodeGenerator(EMPLOYEE.PREFIX,lastEmployee?.employee_code,EMPLOYEE.PAD_LENGTH);
            const userId = await userRepository.createUser(
                connection,
                {
                    employeeCode,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    roleId: data.roleId,
                    branchId: data.branchId,
                    profileImage: data.profileImage ?? null,
                    createdBy: createdBy.user_id,
                }
            );
            const tokenDetails = await passwordResetService.createAccountSetupToken(connection, {

                userId,

                firstName: data.firstName,

                lastName: data.lastName,

                email: data.email

            });

            await emailService.sendEmail({

                to: data.email,

                subject: "Welcome to PNRG Finance",

                html: passwordSetupTemplate({

                    name: `${data.firstName} ${data.lastName}`,

                    username: data.email,

                    setupLink: tokenDetails.setupLink

                })

            });

            await userRepository.commit(connection);
            await auditService.log({
                userId: userId,
                action: "CREATE",
                module: "USER",
                description: `User ${employeeCode} created.`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });

            logger.info(`User Created :${employeeCode}`);
            return {
                userId,
                employeeCode,
                passwordSetupEmail: true
            };
        } catch (error) {
            await userRepository.rollback(connection);
            throw error;

        }
    }

    async deleteUser(userId, currentUser,metadata) {

        const connection =
            await userRepository.beginTransaction();

        try {

            const user =
                await userRepository.getUserById(userId);

            if (!user) {

                throw new ApiError(
                    404,
                    USER_MESSAGES.NOT_FOUND
                );

            }

            if (user.user_id === currentUser.user_id) {

                throw new ApiError(
                    400,
                    USER_MESSAGES.CANNOT_DELETE_SELF
                );

            }

            if (user.role_name === "SUPER_ADMIN") {

                const total =
                    await userRepository.countActiveSuperAdmins(
                        connection
                    );

                if (total <= 1) {

                    throw new ApiError(
                        400,
                        USER_MESSAGES.LAST_SUPER_ADMIN
                    );

                }

            }

            await userRepository.softDeleteUser(

                connection,

                userId,

                currentUser.user_id

            );

            await userRepository.commit(connection);
            await auditService.log({
                userId: userId,
                action: "DELETE",
                module: "USER",
                description: `User soft Deleted. `,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });

        }

        catch (error) {

            await userRepository.rollback(connection);

            throw error;

        }

    }

    async getUsers(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const filters = {
            page,
            limit,
            search: query.search?.trim() || null,
            roleId: query.roleId ? Number(query.roleId) : null,
            branchId: query.branchId ? Number(query.branchId) : null,
            status: query.status || null,
            sortBy: query.sortBy || "created_at",
            sortOrder: query.sortOrder || "ASC"
        };

        const users = await userRepository.getUsers(filters);
        const totalRecords = await userRepository.countUsers(filters);

        const totalPages = Math.ceil(totalRecords / limit);
        const data = users.map(user => ({
            userId: user.user_id,
            employeeCode: user.employee_code,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            profileImage: user.profile_image,
            status: user.status,
            createdAt: user.created_at,
            role: user.role_name,
            branch: user.branch_name
        }));

        return {
            users: data,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        };
    }

    async getUserById(userId) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError(
                404,
                USER_MESSAGES.NOT_FOUND
            )
        }

        return {
            userId: user.user_id,
            roleId: user.role_id,
            branchId: user.branch_id,
            employeeCode: user.employee_code,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            profileImage: user.profile_image,
            status: user.status,
            createdAt: user.created_at,
            updatedAt: user.updatedAt,
            role: user.role_name,
            branch: user.branch_name
        }
    };

    async updateUser(userId, data,metadata) {
        const connection = await userRepository.beginTransaction();

        try {
            const existingUser = await userRepository.getUserById(userId);

            if (!existingUser) {
                throw new ApiError(
                    404,
                    USER_MESSAGES.NOT_FOUND
                );
            }
            const email = await userRepository.findUserByEmail(data.email)
            if (email && email.user_id !== userId) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.EMAIL_EXISTS
                )
            }
            const phone = await userRepository.findUserByPhone(data.phone);


            if (phone && phone.user_id !== userId) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.PHONE_EXISTS
                )
            }

            const role = await userRepository.roleExists(connection, data.roleId);

            if (!role) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.ROLE_NOT_FOUND
                )
            }

            const branch = await userRepository.branchExists(connection, data.branchId);

            if (!branch) {
                throw new ApiError(
                    409,
                    USER_MESSAGES.BRANCH_NOT_FOUND
                );
            }
            await userRepository.updateUser(connection,
                {
                    userId,
                    ...data,
                }
            )

            await userRepository.commit(connection);
            await auditService.log({
                userId: userId,
                action: "UPDATE",
                module: "USER",
                description: `user details updated.`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });
            return;



        } catch (error) {
            await userRepository.rollback(connection);
            throw error;
        }
    }

    async updateUserStatus(userId, status, currentUser, metadata) {
        const connection = await userRepository.beginTransaction();

        try {
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new ApiError(
                    404,
                    USER_MESSAGES.NOT_FOUND
                );
            }
            if (userId === currentUser.user_id) {
                throw new ApiError(
                    400,
                    "You cannot change your own account status."
                );
            }
            if (user.status === status) {
                throw new ApiError(
                    400,
                    `User is already ${status}.`
                )
            }
            await userRepository.updateUserStatus(
                connection,
                userId,
                status
            )

            await userRepository.commit(connection);
            await auditService.log({
                userId: userId,
                action: "STATUS_CHANGE",
                module: "USER",
                description: `User status changed to ${status}.`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });
        } catch (error) {
            await userRepository.rollback(connection);
            throw error;
        }
    }

    async uploadProfileImage(
        userId,
        file,
        currentUser,
        metadata
    ) {
        const connection = await userRepository.beginTransaction();
        try {
            const user = await userRepository.getUserById(userId);

            if (!user) {
                throw new ApiError(
                    404,
                    USER_MESSAGES.NOT_FOUND
                );
            }

            const oldImage = await userRepository.getProfileImage(userId);
            await userRepository.updateProfileImage(
                connection,
                userId,
                file.filename
            );

            await userRepository.commit(connection);
            if (oldImage?.profile_image &&
                oldImage.profile_image !== file.filename
            ) {
                const filePath = path.join(
                    process.cwd(),
                    "src",
                    "uploads",
                    "users",
                    oldImage.profile_image
                );
                try {
                    await fs.unlink(filePath);
                } catch {

                }
            }

            await auditService.log({
                userId: userId,
                action: "UPDATE",
                module: "USER",
                description: `User Profile IMAGE is Updated`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });
            return {
                profileImage: file.filename
            };

        } catch (error) {
            await userRepository.rollback(connection);
            throw error;
        }
    }


}

export default new UserService();

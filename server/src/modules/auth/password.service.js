import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

class PasswordService {

    async hash(password){
        return bcrypt.hash(password,);
    }

    async compare(password, passwordHash){
        return bcrypt.compare(password, passwordHash);
    }

}

export default new PasswordService();
import * as passwordApi from "../api/password.api";

class PasswordService {
  async verifyToken(token) {
    const { data } = await passwordApi.verifyPasswordToken(token);
    return data;
  }

  async setup(payload) {
    const { data } = await passwordApi.setupPassword(payload);
    return data;
  }
}

export default new PasswordService();

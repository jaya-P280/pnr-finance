import lettersRepository from "./letters.repository.js";

class LettersService {
  async saveLetter(data, user) {
    return await lettersRepository.createLetter({
      ...data,
      createdBy: user.user_id,
    });
  }

  async getLetters(user) {
    return await lettersRepository.getLetters(user.user_id);
  }
}

export default new LettersService();

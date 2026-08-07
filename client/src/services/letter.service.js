import * as lettersApi from "../api/letters.api";

class LetterService {
  async createLetter(payload) {
    const { data } = await lettersApi.createLetter(payload);
    return data.data;
  }

  async getLetters() {
    const { data } = await lettersApi.getLetters();
    const list = data?.data ?? data ?? [];
    return Array.isArray(list) ? list : [];
  }
}

export default new LetterService();

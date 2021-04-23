const fetch = require("node-fetch");
const getToken = require('../routes/getToken');


class CharacterServiceGuild {
  constructor(getToken){
    this.getToken = getToken;
  }

  async getCharacterGuild(character) {
    const token = await getToken();
  }



























}

module.exports = CharacterServiceGuild;

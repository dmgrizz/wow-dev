const fetch = require("node-fetch");
const getToken = require('../routes/getToken');


class CharacterService {
  constructor(getToken){
    this.getToken = getToken;
  }

  async getCharacter(realm, name) {
    const token = await getToken();
    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const characterURL = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=" + token;
    const response = await fetch(characterURL)
      .catch(err => console.log(err))
    return response.json();
  }

  async getCharacterMedia(character) {
    const token = await getToken();
    const characterMediaURL = character.media.href + "&locale=en_US&access_token=" + token;
    const mediaResponse = await fetch(characterMediaURL)
      .catch(err => console.log(err));
    return mediaResponse.json();
  }

  async getCharacterStats(character) {
      const token = await getToken();
      const characterStatsURL = character.statistics.href + "&locale=en_US&access_token=" + token;
      const statResponse = await fetch(characterStatsURL)
        .catch(err => console.log(err));
      return statResponse.json();
  }
  async getCharacterEquipment(character) {
    const token = await getToken();
    const characterEquipmentURL = character.equipment.href + "&locale=en_US&access_token=" + token;
    const equipmentResponse = await fetch(characterEquipmentURL)
      .catch(err => console.log(err));
    return equipmentResponse.json();
  }

  async getCharacterSpec(character) {
    const token = await getToken();
    const characterSpec = character.specializations.href + "&locale=en_US&access_token=" + token;
    const specResponse = await fetch(characterSpec)
      .catch(err => console.log(err));
    return specResponse.json();
  }
}

module.exports = CharacterService;

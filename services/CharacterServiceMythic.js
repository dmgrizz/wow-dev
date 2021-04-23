const fetch = require("node-fetch");
const getToken = require('../routes/getToken');


class CharacterServiceMythic {
  constructor(getToken){
    this.getToken = getToken;
  }

  async getMythicInfo(realm, name) {
    const token = await getToken();
    // const characterMythicURL = character.mythic_keystone_profile.href + "&locale=en_US&access_token=" + token;

    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const raiderIO = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=mythic_plus_scores_by_season:current,mythic_plus_recent_runs,mythic_plus_best_runs,mythic_plus_highest_level_runs";
    const mythicResponse = await fetch(raiderIO)
      .catch(err => console.log(err));
    return mythicResponse.json();

  }
  // async getCurrentSeason(characterMythic) {
  //   const token = await getToken();
  //   const currentURL = characterMythic.seasons[0].key.href  + "&locale=en_US&access_token=" + token;
  //   const currentResponse = await fetch(currentURL);
  //   return currentResponse.json();
  // }
}


module.exports = CharacterServiceMythic;

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
    const raiderIO = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=mythic_plus_scores_by_season:previous";
    const mythicResponse = await fetch(raiderIO).catch(err => console.log(err));
    return mythicResponse.json();

  }
  async getCurrentMythicSeason(realm, name) {
    const token = await getToken();
    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const currentURL = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=mythic_plus_scores_by_season:current";
    const currentResponse = await fetch(currentURL).catch(err => console.log(err));

    return currentResponse.json();
  }
  async getBestAndHighestDungeons(realm, name){
    const token = await getToken();
    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const bestAndHighestDungeons = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=mythic_plus_best_runs,mythic_plus_highest_level_runs";
    const dungeonResponse = await fetch(bestAndHighestDungeons).catch(err => console.log(err));
    return dungeonResponse.json();
  }
  async getRecentDungeons(realm, name){
    const token = await getToken();
    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const recentDungeons = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=mythic_plus_recent_runs";
    const recentResponse = await fetch(recentDungeons).catch(err => console.log(err));
    console.log(recentResponse);
    return recentResponse.json();
  }
}


module.exports = CharacterServiceMythic;

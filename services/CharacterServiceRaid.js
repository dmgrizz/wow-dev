const fetch = require("node-fetch");
const getToken = require('../routes/getToken');


class CharacterServiceRaid {
  constructor(getToken){
    this.getToken = getToken;
  }

  async getRaidInfo(realm, name) {
    const token = await getToken();
    // const characterMythicURL = character.mythic_keystone_profile.href + "&locale=en_US&access_token=" + token;

    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const raiderIO = "https://raider.io/api/v1/characters/profile?region=us&realm="+newRealm+"&name="+ newName + "&fields=raid_progression";
    const raidResponse = await fetch(raiderIO)
      .catch(err => console.log(err));
    return raidResponse.json();
  }
  async getRaidSummary(realm, name) {
    const token = await getToken();
    const newName = encodeURIComponent(name);
    const newRealm = realm;
    const wowRaidInfo = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/encounters/raids?namespace=profile-us&locale=en_US&access_token=" + token;
    const wowRaidResponse = await fetch(wowRaidInfo)
      .catch(err => console.log(err));
    return wowRaidResponse.json();
  }
}

module.exports = CharacterServiceRaid;

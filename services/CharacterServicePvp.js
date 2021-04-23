const fetch = require("node-fetch");
const getToken = require('../routes/getToken');

//reason for making these classes - I wanted to refactor my code. So it would be cleaner and easier to get access to this info -
// instead of making huge fetch requests on every post or get request - check to see witch loads faster as well -
class CharacterServicePvp {
  constructor(getToken){
    this.getToken = getToken;
  }
  async getCharacterPvp(character) {
    const token = await getToken();
    const characterPvpURL = character.pvp_summary.href + "&locale=en_US&access_token=" + token;
    const pvpResponse = await fetch(characterPvpURL)
      .catch(err => console.log(err));
    return pvpResponse.json();
  }

  async getCharacterTwosPvpBracket(characterPvp) {
    const token = await getToken();
    const pvpBrackets = characterPvp.brackets;
    var twosPvpBracketUrl;

    if(characterPvp.brackets && characterPvp.brackets[0]) {
       twosPvpBracketUrl = characterPvp.brackets[0].href + "&locale=en_US&access_token=" + token;
       const twosPvpBracket = await fetch(twosPvpBracketUrl)
        .catch(err => console.log(err));

       return twosPvpBracket.json();
    
    } else {
      return 0;
    }
  }

  async getCharacterThreesPvpBracket(characterPvp) {
    const token = await getToken();
    const pvpBrackets = characterPvp.brackets;
      var threesPvpBracketUrl;
    if(characterPvp.brackets && characterPvp.brackets[1]) {
       threesPvpBracketUrl = characterPvp.brackets[1].href + "&locale=en_US&access_token=" + token;
       const threesPvpBracket = await fetch(threesPvpBracketUrl)
        .catch(err => console.log(err));
       return threesPvpBracket.json();
    } else {
      return 0;
    }

  }

  async getCharacterBGPvpBracket(characterPvp) {
    const token = await getToken();
    const pvpBrackets = characterPvp.brackets;
    var bgPvpBracketUrl;
    if(characterPvp.brackets && characterPvp.brackets[2]) {
      bgPvpBracketUrl = characterPvp.brackets[2].href + "&locale=en_US&access_token=" + token;
      const bgPvpBracket = await fetch(bgPvpBracketUrl);
      return bgPvpBracket.json();
    } else {
      return 0;
    }
  }
}

module.exports = CharacterServicePvp;

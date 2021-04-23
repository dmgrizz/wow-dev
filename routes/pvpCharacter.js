const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../routes/getToken');
const User = require('../models/User');
const Character = require('../models/Profile');
const CharacterService = require("../services/CharacterService");
const CharacterServicePvp = require("../services/CharacterServicePvp");
const ensureAuthenticated = require('../middlewares/authenticated');

const characterService = new CharacterService(getToken);
const characterServicePvp = new CharacterServicePvp(getToken);

module.exports = app => {
  app.get('/pvpInfo/:charName/:realm', async (req, res, next) => {
    var battletag;
    let filterCharList;
    if(req.isAuthenticated()){
       battletag = req.user.battletag;
       const user = await User.findOne({battletag: battletag});
         var avatar = user.characters[0].media;
         var characterName = user.characters[0].name;
         var dropdownCharList = [];
           for (var i = 0; i < user.characters.length; i++) {
             var dropdownChar = user.characters[i].name;
             dropdownCharList.push(dropdownChar);
           }

         filterCharList = dropdownCharList.filter(function(ch) {
           return ch !== characterName;
         });
    }

      var realm = req.params.realm;
      var charName = req.params.charName;
      var playerRealm = _.lowerCase(realm);
      var playerName = charName;
      var newName = playerName.toLowerCase().replace(/\s/g, '');
      var newRealm = playerRealm.replace(/\s/g, '');

        const character = await characterService.getCharacter(newRealm, newName);
        const characterPvp = await characterServicePvp.getCharacterPvp(character);
        const characterSpec  = await characterService.getCharacterSpec(character);

        const pvpTwosBracket = await characterServicePvp.getCharacterTwosPvpBracket(characterPvp);
        const pvpThreesBracket = await characterServicePvp.getCharacterThreesPvpBracket(characterPvp);
        const pvpBgBracket = await characterServicePvp.getCharacterBGPvpBracket(characterPvp);

        if(character.active_title){
          var activeTitle = character.active_title.name;
        }
        if(character.guild){
            var guild = character.guild.name;
          }
          if(character.covenant_progress){
            var covenant    = character.covenant_progress.chosen_covenant.name;
            var renown      = character.covenant_progress.renown_level;
            var covenantId  = character.covenant_progress.chosen_covenant.id;
          }
        var charObject = {
          name: character.name,
          race: character.race.name,
          class: character.character_class.name,
          spec: character.active_spec.name,
          itemLvl: character.equipped_item_level,
          faction: character.faction.name,
          realm: character.realm.name,
          guild: guild,
          activeTitle:  activeTitle,
          covenant:     covenant,
          renown:       renown,
          covenantId:   covenantId
        }
        if(charObject.faction === "Horde") {
          factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-horde.2a80e0466e51d85c8cf60336e16fe8b8.png";
        } else if(charObject.faction === "Alliance") {
          factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-alliance.bb36e70f5f690a5fc510ed03e80aa259.png";
        }
//PVP TALENT INFO
      let splicedPvpSpecOne = {};
      let splicedPvpSpecTwo = {};
      let spellPvpImgs = [];
      let spellPvpToolTips = [];
      let spellPvpToolTipsTwo = [];
      let spellPvpToolTipsThree = [];
      let pickedPvpTalents = [];
      var specPvpNames = [];
      var spec = characterSpec;

      for (var i = 0; i < spec.specializations.length; i++) {
        allPvpSpecs = spec.specializations[i].specialization.name;
        specPvpNames.push(allPvpSpecs);
          if(spec.specializations[i].pvp_talent_slots) {
            for (var x = 0; x < spec.specializations[i].pvp_talent_slots.length; x++) {

              var toolTips;
              if(spec.specializations[0] && spec.specializations[0].pvp_talent_slots) {
                toolTips = spec.specializations[0].pvp_talent_slots[x].selected.spell_tooltip.spell.id;
              }
              var toolTipsTwo;
              if(spec.specializations[1] && spec.specializations[1].pvp_talent_slots) {
                toolTipsTwo = spec.specializations[1].pvp_talent_slots[x].selected.spell_tooltip.spell.id;
              }
              var toolTipsThree;
                if(spec.specializations[2] && spec.specializations[2].pvp_talent_slots) {
                   toolTipsThree = spec.specializations[2].pvp_talent_slots[x].selected.spell_tooltip.spell.id;
                }

              var toolTipName = spec.specializations[i].pvp_talent_slots[x].selected.spell_tooltip.spell.name;

              pickedPvpTalents.push(toolTipName);
              spellPvpToolTips.push(toolTips);
              spellPvpToolTipsTwo.push(toolTipsTwo);
              spellPvpToolTipsThree.push(toolTipsThree);

            }
          }
      }
      splicedPvpSpecOne = spellPvpToolTips;
      splicedPvpSpecOne.splice(3,6);
      splicedPvpSpecTwo = spellPvpToolTipsTwo;
      splicedPvpSpecTwo.splice(3,6);
      splicedPvpSpecThree = spellPvpToolTipsThree;
      splicedPvpSpecThree.splice(3,6);

//PVP INFO START
        let twoCr;
        let threeRating;
        let rbgCr;
        let honorLvl       = characterPvp.honor_level;
        let honorableKills = characterPvp.honorable_kills;
        let twoMatches;
        let twoWins;
        let twoLost;
        let twoWinRate;
        let roundedTwos;
        let threeMatches;
        let threeWins;
        let threeLost;
        let threeWinRate;
        let rbgMatches;
        let rbgWins;
        let rbgLost;
        let rbgWinRate;
        let roundedRbgs;
        let weeklyTwoMatches;
        let weeklyTwoWins;
        let weeklyTwoLost;
        let weeklyTwoWinRate;
        let weeklyRoundedTwos;
        let weeklyThreeMatches;
        let weeklyThreeWins;
        let weeklyThreeLost;
        let weeklyThreeWinRate;
        let weeklyRoundedThrees;
        let weeklyRbgMatches;
        let weeklyRbgWins;
        let weeklyRbgLost;
        let weeklyRbgWinRate;
        let weeklyRoundedRbgs;


        if(pvpTwosBracket.bracket.id === 0) {
          twoCr = pvpTwosBracket.rating;
          if(twoCr > 0){
            twoMatches = pvpTwosBracket.season_match_statistics.played;
            twoWins = pvpTwosBracket.season_match_statistics.won;
            twoLost = pvpTwosBracket.season_match_statistics.lost;
            twoWinRate  = (twoWins / twoMatches) * 100;
            roundedTwos = _.round(twoWinRate, 1);

            weeklyTwoMatches  = pvpTwosBracket.weekly_match_statistics.played;
            weeklyTwoWins     = pvpTwosBracket.weekly_match_statistics.won;
            weeklyTwoLost     = pvpTwosBracket.weekly_match_statistics.lost;
            weeklyTwoWinRate  = (weeklyTwoWins  / weeklyTwoMatches ) * 100;
            weeklyRoundedTwos = _.round(weeklyTwoWinRate, 1);
          }
        } else if(pvpTwosBracket.bracket.id === 1){ //if the bracket id = 1 then its 3v3 bracket rating means the player has not played 2s
          threeRating = pvpTwosBracket.rating;
          if(threeRating > 0){
            threeMatches  = pvpTwosBracket.season_match_statistics.played;
            threeWins     = pvpTwosBracket.season_match_statistics.won;
            threeLost     = pvpTwosBracket.season_match_statistics.lost;
            threeWinRate  = (threeWins / threeMatches) * 100;
            roundedThrees = _.round(threeWinRate, 1);

            weeklyThreeMatches  = pvpTwosBracket.weekly_match_statistics.played;
            weeklyThreeWins     = pvpTwosBracket.weekly_match_statistics.won;
            weeklyThreeLost     = pvpTwosBracket.weekly_match_statistics.lost;
            weeklyThreeWinRate  = (weeklyThreeWins  / weeklyThreeMatches) * 100;
            weeklyRoundedThrees = _.round(weeklyThreeWinRate, 1);
          }
        } else if(pvpTwosBracket.bracket.id === 3) {  //if the bracket id = 3 then its RBG bracket meaning the player has not played any 2s or 3s
          rbgCr = pvpTwosBracket.rating;
          if(rbgCr > 0){
            rbgMatches   = pvpTwosBracket.season_match_statistics.played;
            rbgWins      = pvpTwosBracket.season_match_statistics.won;
            rbgLost      = pvpTwosBracket.season_match_statistics.lost;
            rbgWinRate   = (rbgWins / rbgMatches) * 100;
            roundedRbgs  = _.round(rbgWinRate, 1);

            weeklyRbgMatches   = pvpTwosBracket.weekly_match_statistics.played;
            weeklyRbgWins      = pvpTwosBracket.weekly_match_statistics.won;
            weeklyRbgLost      = pvpTwosBracket.weekly_match_statistics.lost;
            weeklyRbgWinRate   = (weeklyRbgWins  / weeklyRbgMatches) * 100;
            weeklyRoundedRbgs  = _.round(weeklyRbgWinRate, 1);
          }
        }

        if(pvpThreesBracket !== 0 && pvpThreesBracket.bracket.id === 1) { // if someone has all 3 ranks this will be used
          threeRating = pvpThreesBracket.rating;
          if(threeRating > 0){
            threeMatches  = pvpThreesBracket.season_match_statistics.played;
            threeWins     = pvpThreesBracket.season_match_statistics.won;
            threeLost     = pvpThreesBracket.season_match_statistics.lost;
            threeWinRate  = (threeWins / threeMatches) * 100;
            roundedThrees = _.round(threeWinRate, 1);

            weeklyThreeMatches  = pvpThreesBracket.weekly_match_statistics.played;
            weeklyThreeWins     = pvpThreesBracket.weekly_match_statistics.won;
            weeklyThreeLost     = pvpThreesBracket.weekly_match_statistics.lost;
            weeklyThreeWinRate  = (weeklyThreeWins  / weeklyThreeMatches) * 100;
            weeklyRoundedThrees = _.round(weeklyThreeWinRate, 1);
          }
        } else if(pvpThreesBracket !== 0 && pvpThreesBracket.bracket.id === 3) { //incase someone only has 2v2 rank & BG rank
          rbgCr = pvpThreesBracket.rating;
          if(rbgCr > 0){
            rbgMatches   = pvpThreesBracket.season_match_statistics.played;
            rbgWins      = pvpThreesBracket.season_match_statistics.won;
            rbgLost      = pvpThreesBracket.season_match_statistics.lost;
            rbgWinRate   = (rbgWins / rbgMatches) * 100;
            roundedRbgs  = _.round(rbgWinRate, 1);

            weeklyThreeMatches  = pvpThreesBracket.weekly_match_statistics.played;
            weeklyThreeWins     = pvpThreesBracket.weekly_match_statistics.won;
            weeklyThreeLost     = pvpThreesBracket.weekly_match_statistics.lost;
            weeklyThreeWinRate  = (weeklyThreeWins  / weeklyThreeMatches) * 100;
            weeklyRoundedThrees = _.round(weeklyThreeWinRate, 1);
          }
        }
        if(pvpBgBracket !== 0  && pvpBgBracket.bracket.id === 3) { // if someone has all 3 ranks this will be used
           rbgCr = pvpBgBracket.rating;
           if(rbgCr > 0){
             rbgMatches   = pvpBgBracket.season_match_statistics.played;
             rbgWins      = pvpBgBracket.season_match_statistics.won;
             rbgLost      = pvpBgBracket.season_match_statistics.lost;
             rbgWinRate   = (rbgWins / rbgMatches) * 100;
             roundedRbgs  = _.round(rbgWinRate, 1);

             weeklyRbgMatches   = pvpBgBracket.weekly_match_statistics.played;
             weeklyRbgWins      = pvpBgBracket.weekly_match_statistics.won;
             weeklyRbgLost      = pvpBgBracket.weekly_match_statistics.lost;
             weeklyRbgWinRate   = (weeklyRbgWins  / weeklyRbgMatches) * 100;
             weeklyRoundedRbgs  = _.round(weeklyRbgWinRate, 1);
           }
        }

        res.render("charPvp", {
          avatar,
          battletag,
          characterName,
          filterCharList,
          activeTitle,
          factionPic,
          charClass: charObject.class,
          itemLvl: charObject.itemLvl,
          guildName: charObject.guild,
          race: charObject.race,
          activeSpec: charObject.spec,
          covenantName: charObject.covenant,
          renown: charObject.renown,
          faction: charObject.faction,
          realm: charObject.realm,
          playerName: charObject.name,
          spellIds: splicedPvpSpecOne,
          spellIdsTwo: splicedPvpSpecTwo,
          spellIdsThree: splicedPvpSpecThree,
          specNames: specPvpNames,
          pickedTalents: pickedPvpTalents,
          threeRating,
          twoCr,
          rbgCr,
          twoMatches,
          twoWins,
          twoLost,
          roundedTwos,
          threeMatches,
          threeWins,
          threeLost,
          roundedThrees,
          rbgMatches,
          rbgWins,
          rbgLost,
          rbgWinRate,
          roundedRbgs,
          weeklyTwoMatches,
          weeklyTwoWins,
          weeklyTwoLost,
          weeklyTwoWinRate,
          weeklyRoundedTwos,
          weeklyThreeMatches,
          weeklyThreeWins,
          weeklyThreeLost,
          weeklyThreeWinRate,
          weeklyRoundedThrees,
          weeklyRbgMatches,
          weeklyRbgWins,
          weeklyRbgLost,
          weeklyRbgWinRate,
          weeklyRoundedRbgs,
          honorLvl,
          honorableKills
        });

  });
}

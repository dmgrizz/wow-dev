const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../routes/getToken');
const User = require('../models/User');
const Character = require('../models/Profile');
const CharacterService = require("../services/CharacterService");
const CharacterServiceMythic = require("../services/CharacterServiceMythic");
const CharacterServiceRaid = require("../services/CharacterServiceRaid");
const ensureAuthenticated = require('../middlewares/authenticated');

const characterService = new CharacterService(getToken);

module.exports = app => {
  app.get("/comingSoon/:charName/:realm", async (req, res, next) => {
    var battletag;
    let filterCharList;
    if(req.isAuthenticated()){
       battletag = req.user.battletag;
       const user = await User.findOne({battletag: battletag});
         var avatar = user.characters[0].media;
         var characterName = user.characters[0].name;
         var dropdownCharList = [];
           for (var i = 0; i < user.characters.length; i++) {
             var dropdownChar = user.characters[i];
             dropdownCharList.push(dropdownChar);
           }

         filterCharList = dropdownCharList.filter(function(ch) {
           return ch.name !== characterName;
         });

    }
        var realm = req.params.realm;
        var charName = req.params.charName;
        var playerRealm = realm;
        var playerName = charName;
        console.log(charName);
        var newName = playerName.toLowerCase().replace(/ =/g, '');
        var spacedRealm  = playerRealm.toLowerCase().replace(/'/g, '');
        var newRealm = spacedRealm.replace(/\s/g, '-');

        const character       = await characterService.getCharacter(newRealm, newName).catch(err => console.log(err));
        const stats           = await characterService.getCharacterStats(character).catch(err => console.log(err));

        var activeTitle;
        if(character.active_title){
          activeTitle = character.active_title.name;
        }
        var guild;
        if(character.guild){
            guild = character.guild.name;
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
          activeTitle: activeTitle,
          covenant: covenant,
          renown: renown,
          covenantId: covenantId
        }
        if(charObject.faction === "Horde") {
          factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-horde.2a80e0466e51d85c8cf60336e16fe8b8.png";
        } else if(charObject.faction === "Alliance") {
          factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-alliance.bb36e70f5f690a5fc510ed03e80aa259.png";
        }
    res.render("comingSoon", {
      battletag,
      avatar,
      activeTitle,
      characterName,
      charClass: charObject.class,
      guildName: charObject.guild,
      race: charObject.race,
      activeSpec: charObject.spec,
      covenantName: charObject.covenant,
      renown: charObject.renown,
      itemLvl: charObject.itemLvl,
      renown: charObject.renown,
      faction: charObject.faction,
      realm: charObject.realm,
      playerName: charObject.name,
      factionPic,
      filterCharList
    });
  });

}

const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../routes/getToken');
const User = require('../models/User');
const Character = require('../models/Profile');
const CharacterService = require("../services/CharacterService");
const ensureAuthenticated = require('../middlewares/authenticated');

const characterService = new CharacterService(getToken);

module.exports = app => {

  app.post('/userPro', ensureAuthenticated, async (req, res, next) => {
    
    var battletag = req.user.battletag;
    const user = await User.findOne({battletag: battletag});

    var char = req.body.selectChar;

    const findChar = await Character.findOne({name: char});

    var avatar = findChar.media;
    var factionPic;
    var characterName = findChar.name;
    var faction = findChar.faction;
    var realm = findChar.realm;

    if(faction === "Horde") {
      factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-horde.2a80e0466e51d85c8cf60336e16fe8b8.png";
    } else if(faction === "Alliance") {
      factionPic = "https://assets.worldofwarcraft.com/static/components/Logo/Logo-alliance.bb36e70f5f690a5fc510ed03e80aa259.png";
    } else {
      factionPic = findChar.mediaservices
    }

    var dropdownCharList = [];
      for (var i = 0; i < user.characters.length; i++) {
        var dropdownChar = user.characters[i].name;
        dropdownCharList.push(dropdownChar);
      }

    let filterCharList = dropdownCharList.filter(function(ch) {
      return ch !== characterName;
    });

    var playerRealm = _.lowerCase(realm);
    var playerName = characterName;
    var newName = playerName.toLowerCase().replace(/\s/g, '');
    var newRealm = playerRealm.replace(/\s/g, '');

    const character      = await characterService.getCharacter(newRealm, newName);
    const stats          = await characterService.getCharacterStats(character);
    const characterEquip = await characterService.getCharacterEquipment(character);
    const characterSpec  = await characterService.getCharacterSpec(character);

    if(character.active_title){
      var activeTitle = character.active_title.name;
    }

    if(character.guild){
        var guild = character.guild.name;
      }
  // covenantPhoto:"https://us.api.blizzard.com/data/wow/media/covenant/"+ covenantId +"?namespace=static-us&locale=en_US&access_token=" + token,
    var charObject = {
      race: character.race.name,
      class: character.character_class.name,
      spec: character.active_spec.name,
      guild: character.guild.name,
      itemLvl: character.equipped_item_level,
      activeTitle: activeTitle,
      covenant: character.covenant_progress.chosen_covenant.name,
      renown: character.covenant_progress.renown_level,
      covenantId: character.covenant_progress.chosen_covenant.id
    }
// equipment info start
    console.log(charObject.itemLvl);

    let equipmentLeft = {};
    let equipmentIds = {};
    let equipmentBonus = {};
    let equipmentLvl = {};
    let equipment = characterEquip.equipped_items;

    var equipIds = [];
    var equipBonus = [];
    var equipSlot = [];
    var equipLvl = [];

    for (var i = 0; i < equipment.length; i++) {
      var slot = equipment[i].slot.name;
      var quality = equipment[i].quality.name;
      var itemId = equipment[i].item.id;
      var itemBonus = equipment[i].bonus_list;
      var itemLvl = equipment[i].level.value;

      equipSlot.push(slot);
      equipLvl.push(itemLvl);
      equipIds.push(itemId);

      if(itemBonus){
        equipBonus.push(itemBonus.join(':'));
      }
    }

    equipmentIds = equipIds;
    equipmentLeft = equipSlot;
    equipmentBonus = equipBonus;
    equipmentLvl = equipLvl;

  //ITEM IMAGES
    let wowHeadLinksLeft = {};
    var wowHeadEquip = [];

    for (var i = 0; i < equipment.length; i++) {
      var wowHeadItems = "https://www.wowhead.com/item=" + equipmentIds[i] + "&bonus=" + equipmentBonus[i];
      wowHeadEquip.push(wowHeadItems);
    }
    wowHeadLinksLeft = wowHeadEquip;

  // CHARACTER STATS
    var crit        = Math.round((stats.melee_crit.value + Number.EPSILON) * 100) / 100;
    var haste       = Math.round((stats.melee_haste.value + Number.EPSILON) * 100) / 100;
    var mastery     = Math.round((stats.mastery.value + Number.EPSILON) * 100) / 100;
    var versatility = Math.round((stats.versatility_damage_done_bonus + Number.EPSILON) * 100) / 100;
    var health      = stats.health;
    var mana        = stats.power;
    var strength    = stats.strength.effective;
    var agility     = stats.agility.effective;
    var intellect   = stats.intellect.effective;
    var stamina     = stats.stamina.effective;

  // TALENTS INFO
    let splicedSpecOne = {};
    let splicedSpecTwo = {};
    let pickedTalents = [];
    let spellImgs = [];
    let spellToolTips = [];
    let spellToolTipsTwo = [];
    let spellToolTipsThree = [];
    let pvpTalents = [];
    var specNames = [];
    var spec = characterSpec;
  // console.log(spec);

    for (var i = 0; i < spec.specializations.length; i++) {
      allSpecs = spec.specializations[i].specialization.name;
      // console.log(allSpecs);
      specNames.push(allSpecs);
        if(spec.specializations[i].talents) {
          for (var x = 0; x < spec.specializations[i].talents.length; x++) {
            // console.log(spec.specializations[i].talents[x].spell_tooltip.spell.id);
            var toolTips;
            if(spec.specializations[0].talents) {
              toolTips = spec.specializations[0].talents[x].spell_tooltip.spell.id;
            }
            var toolTipsTwo;
            if(spec.specializations[1].talents) {
              toolTipsTwo = spec.specializations[1].talents[x].spell_tooltip.spell.id;
            }
            var toolTipsThree;
              if(spec.specializations[2].talents) {
                 toolTipsThree = spec.specializations[2].talents[x].spell_tooltip.spell.id;
                 // console.log(toolTipsThree);
              }

            var toolTipName = spec.specializations[i].talents[x].spell_tooltip.spell.name;
            // let picked = spec.specializations[i].talents[x].talent.name;

            pickedTalents.push(toolTipName);
            spellToolTips.push(toolTips);
            spellToolTipsTwo.push(toolTipsTwo);
            spellToolTipsThree.push(toolTipsThree);

          }
        }
    }
    splicedSpecOne = spellToolTips;
    splicedSpecOne.splice(7,14);
    splicedSpecTwo = spellToolTipsTwo;
    splicedSpecTwo.splice(7,14);
    splicedSpecThree = spellToolTipsThree;
    splicedSpecThree.splice(0,14);


    res.render("charPro", {
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
      faction,
      factionPic,
      realm,
      filterCharList,
      wowHeadLinksLeft,
      equipmentLvl,
      equipmentLeft,
      crit,
      haste,
      mastery,
      versatility,
      health,
      strength,
      agility,
      intellect,
      stamina,
      mana,
      specNames,
      pickedTalents,
      spellIds: splicedSpecOne,
      spellIdsTwo: splicedSpecTwo,
      spellIdsThree: splicedSpecThree,
      pvpTalents
    });

  });

}

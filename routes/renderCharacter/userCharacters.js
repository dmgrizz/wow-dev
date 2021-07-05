const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../../routes/getToken');
const bodyParser = require('body-parser');
const User = require('../../models/User');
const Character = require('../../models/Profile');
const CharacterService = require("../../services/CharacterService");
const CharacterServiceMythic = require("../../services/CharacterServiceMythic");
const CharacterServiceRaid = require("../../services/CharacterServiceRaid");
const ensureAuthenticated = require('../../middlewares/authenticated');

const characterService = new CharacterService(getToken);
const characterServiceMythic = new CharacterServiceMythic(getToken);
const characterServiceRaid = new CharacterServiceRaid(getToken);
const dungeons = require("../../modules/dungeons");
const raidBosses = require("../../modules/raidBosses");


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
        var dropdownChar = user.characters[i];
        dropdownCharList.push(dropdownChar);
      }

    let filterCharList = dropdownCharList.filter(function(ch) {
      return ch.name !== characterName;
    });

    var playerRealm = realm;
    var playerName = characterName;
    var newName = playerName.toLowerCase().replace(/ =/g, '');
    var spacedRealm  = playerRealm.toLowerCase().replace(/'/g, '');
    var newRealm = spacedRealm.replace(/\s/g, '-');

    const character            = await characterService.getCharacter(newRealm, newName).catch(err => console.log(err));
    const stats                = await characterService.getCharacterStats(character).catch(err => console.log(err));
    const characterEquip       = await characterService.getCharacterEquipment(character).catch(err => console.log(err));
    const characterSpec        = await characterService.getCharacterSpec(character).catch(err => console.log(err));
    const previousMythicSeason = await characterServiceMythic.getMythicInfo(newRealm, newName).catch(err => console.log(err));
    const currentMythicSeason = await characterServiceMythic.getCurrentMythicSeason(newRealm, newName).catch(err => console.log(err));
    const getBestAndHighestDungeons = await characterServiceMythic.getBestAndHighestDungeons(newRealm, newName).catch(err => console.log(err));
    const getRecentDungeons = await characterServiceMythic.getRecentDungeons(newRealm, newName).catch(err => console.log(err));
    const characterRaid        = await characterServiceRaid.getRaidInfo(newRealm, newName).catch(err => console.log(err));
    const characterRaidWowInfo = await characterServiceRaid.getRaidSummary(newRealm, newName).catch(err => console.log(err));

    if(character.active_title) {
      var activeTitle = character.active_title.name;
    }

    if(character.guild) {
        var guild = character.guild.name;
    }

    if(character.covenant_progress) {
        var covenant    = character.covenant_progress.chosen_covenant.name;
        var renown      = character.covenant_progress.renown_level;
        var covenantId  = character.covenant_progress.chosen_covenant.id;
    }

    var charObject = {
      name: character.name,
      race: character.race.name,
      class: character.character_class.name,
      spec: character.active_spec.name,
      guild: guild,
      itemLvl: character.equipped_item_level,
      activeTitle: activeTitle,
      covenant: character.covenant_progress.chosen_covenant.name,
      renown: character.covenant_progress.renown_level,
      covenantId: character.covenant_progress.chosen_covenant.id,
      faction: character.faction.name,
      realm: character.realm.name
    }
//EQUIPMENT INFO
    let equipment = characterEquip.equipped_items;
    let equipmentLeft   = {};
    let equipmentIds    = {};
    let equipmentBonus  = {};
    let equipmentLvl    = {};

    var equipIds    = [];
    var equipBonus  = [];
    var equipSlot   = [];
    var equipLvl    = [];

    for (var i = 0; i < equipment.length; i++) {
      var slot      = equipment[i].slot.name;
      var quality   = equipment[i].quality.name;
      var itemId    = equipment[i].item.id;
      var itemBonus = equipment[i].bonus_list;
      var itemLvl   = equipment[i].level.value;

      equipSlot.push(slot);
      equipLvl.push(itemLvl);
      equipIds.push(itemId);

      if(itemBonus) {
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
    let splicedSpecOne      = {};
    let splicedSpecTwo      = {};
    let pickedTalents       = [];
    let spellImgs           = [];
    let spellToolTips       = [];
    let spellToolTipsTwo    = [];
    let spellToolTipsThree  = [];
    let pvpTalents          = [];
    var specNames           = [];
    var spec = characterSpec;

    for (var i = 0; i < spec.specializations.length; i++) {
      allSpecs = spec.specializations[i].specialization.name;
      specNames.push(allSpecs);
        if(spec.specializations[i].talents) {
          for (var x = 0; x < spec.specializations[i].talents.length; x++) {
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

              }

            var toolTipName = spec.specializations[i].talents[x].spell_tooltip.spell.name;
            let picked = spec.specializations[i].talents[x].talent.name;

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

    var mPlusRecent = [];
    var mPlusBest = [];
    var mPlusHighest = [];
    var previousMPlusScoreOverall;
    var previousMPlusScoreDPS;
    var previousMPlusScoreHealer;
    var previousMPlusScoreTank;
    var currentMPlusScoreOverall
    var currentMPlusScoreDPS;
    var currentMPlusScoreHealer;
    var currentMPlusScoreTank;

  if(previousMythicSeason.mythic_plus_scores_by_season) {

        previousMPlusScoreOverall  = previousMythicSeason.mythic_plus_scores_by_season[0].scores.all;
        previousMPlusScoreDPS      = previousMythicSeason.mythic_plus_scores_by_season[0].scores.dps;
        previousMPlusScoreHealer   = previousMythicSeason.mythic_plus_scores_by_season[0].scores.healer;
        previousMPlusScoreTank     = previousMythicSeason.mythic_plus_scores_by_season[0].scores.tank;
  }

  if(currentMythicSeason.mythic_plus_scores_by_season) {
        currentMPlusScoreOverall   = currentMythicSeason.mythic_plus_scores_by_season[0].scores.all;
        currentMPlusScoreDPS       = currentMythicSeason.mythic_plus_scores_by_season[0].scores.dps;
        currentMPlusScoreHealer    = currentMythicSeason.mythic_plus_scores_by_season[0].scores.healer
        currentMPlusScoreTank      = currentMythicSeason.mythic_plus_scores_by_season[0].scores.tank;

        mPlusRecent = getRecentDungeons.mythic_plus_recent_runs;
        mPlusBest = getBestAndHighestDungeons.mythic_plus_best_runs;
        mPlusHighest = getBestAndHighestDungeons.mythic_plus_highest_level_runs;

    var localDateRecent = [];
    var localDateBest = [];
    var localDateHighest = [];
    var recentTimes = [];
    var bestTimes = [];
    var highestTimes = [];

      for (var i = 0; i < mPlusRecent.length; i++) {
          var date = new Date(mPlusRecent[i].completed_at);
          localDateRecent.push(date.toUTCString().slice(5,-12));
            var ms = mPlusRecent[i].clear_time_ms;
            var mins = (ms / (1000 * 60)).toFixed(2);
            var newMins = mins.replace(/\./g, ':');
            recentTimes.push(newMins);
      }

      for (var i = 0; i < mPlusBest.length; i++) {
          var date = new Date(mPlusBest[i].completed_at);
          localDateBest.push(date.toUTCString().slice(5,-12));
            var ms = mPlusBest[i].clear_time_ms;
            var mins = (ms / (1000 * 60)).toFixed(2);
            var newMins = mins.replace(/\./g, ':');
            bestTimes.push(newMins);

      }

      for (var i = 0; i < mPlusHighest.length; i++) {
          var date = new Date(mPlusHighest[i].completed_at);
          localDateHighest.push(date.toUTCString().slice(5,-12));
            var ms = mPlusHighest[i].clear_time_ms;
            var mins = (ms / (1000 * 60)).toFixed(2);
            var newMins = mins.replace(/\./g, ':');
            highestTimes.push(newMins);
      }
  }

//RAID INFO
    var castleNathria = characterRaid.raid_progression["castle-nathria"];
    var raidProgress  = castleNathria.summary;
    var totalBosses   = castleNathria.total_bosses;
    var normalBosses  = castleNathria.normal_bosses_killed;
    var heroicBosses  = castleNathria.heroic_bosses_killed;
    var mythicBosses  = castleNathria.mythic_bosses_killed;

    const expansions = characterRaidWowInfo.expansions;

    var currentExpansion;
    var difficulty = [];
    var normalBossesDefeated = [];
    var heroicBossesDefeated = [];
    var mythicBossesDefeated = [];

    if(expansions) {
      for (var i = 0; i < expansions.length; i++) {
      if(expansions[i].expansion.name === "Shadowlands" || expansions[i].expansion.id === 499) {
          currentExpansion = expansions[i].expansion.name;

        for (var x = 0; x < expansions[i].instances.length; x++) {
          for (var m = 0; m < expansions[i].instances[x].modes.length; m++) {
              if(expansions[i].instances[x].modes[m].difficulty.type !==  "LFR") {
                difficulty.push(expansions[i].instances[x].modes[m]);
              }
            }
          }
        }
      }
    }

    var lastNormalKill = [];
    var lastHeroicKill = [];
    var lastMythicKill = [];
    var normalKillCount = [];
    var heroicKillCount = [];
    var mythicKillCount = [];
    var normalToolTip = [];
    var heroicToolTip = [];
    var mythicToolTip = [];

    for (var i = 0; i < difficulty.length; i++) {
      if(difficulty[i].difficulty.name === "Normal") {
        for (var e = 0; e < difficulty[i].progress.encounters.length; e++) {
            var totalKills = difficulty[i].progress.encounters[e].completed_count;
            var lastKill = new Date(difficulty[i].progress.encounters[e].last_kill_timestamp);
            normalToolTip.push(lastKill);
            normalKillCount.push(totalKills);
            lastNormalKill.push(lastKill.toUTCString().slice(5,-12));
            normalBossesDefeated.push(difficulty[i].progress.encounters[e].encounter);
        }
      }

      if(difficulty[i].difficulty.name === "Heroic") {
        for (var e = 0; e < difficulty[i].progress.encounters.length; e++) {
            var totalKills = difficulty[i].progress.encounters[e].completed_count;
            var lastKill = new Date(difficulty[i].progress.encounters[e].last_kill_timestamp);
            heroicToolTip.push(lastKill.toUTCString());
            heroicKillCount.push(totalKills);
            lastHeroicKill.push(lastKill.toUTCString().slice(5,-12));
            heroicBossesDefeated.push(difficulty[i].progress.encounters[e].encounter);

        }
      }

      if(difficulty[i].difficulty.name === "Mythic") {
        for (var e = 0; e < difficulty[i].progress.encounters.length; e++) {
            var totalKills = difficulty[i].progress.encounters[e].completed_count;
            var lastKill = new Date(difficulty[i].progress.encounters[e].last_kill_timestamp);
            mythicToolTip.push(lastKill);
            mythicKillCount.push(totalKills);
            lastMythicKill.push(lastKill.toUTCString().slice(5,-12));
            mythicBossesDefeated.push(difficulty[i].progress.encounters[e].encounter);
        }
      }
    }

    res.render("userProfile", {
      battletag,
      avatar,
      activeTitle,
      characterName,
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
      dungeons,
      raidBosses,
      previousMPlusScoreOverall,
      previousMPlusScoreDPS,
      previousMPlusScoreHealer,
      previousMPlusScoreTank,
      currentMPlusScoreOverall,
      currentMPlusScoreDPS,
      currentMPlusScoreHealer,
      currentMPlusScoreTank,
      mPlusRecent,
      mPlusBest,
      mPlusHighest,
      localDateRecent,
      localDateBest,
      localDateHighest,
      recentTimes,
      bestTimes,
      highestTimes,
      castleNathria,
      raidProgress,
      totalBosses,
      normalBosses,
      heroicBosses,
      mythicBosses,
      activeTitle,
      currentExpansion,
      difficulty,
      normalBossesDefeated,
      heroicBossesDefeated,
      mythicBossesDefeated,
      lastNormalKill,
      lastHeroicKill,
      lastMythicKill,
      normalToolTip,
      heroicToolTip,
      mythicToolTip,
      normalKillCount,
      heroicKillCount,
      mythicKillCount,
      spellIds: splicedSpecOne,
      spellIdsTwo: splicedSpecTwo,
      spellIdsThree: splicedSpecThree
    });
  });
}

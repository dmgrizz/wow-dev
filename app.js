require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const request = require('request');
const fetch = require('node-fetch');
var _ = require('lodash');
const passport = require('passport');
var BnetStrategy = require('passport-bnet').Strategy;
const refresh = require('./routes/token');
// const guildMod = require('./routes/guild');
// const getToken = require('./routes/getToken');
// const getData = require('./modules/fetchMod');
const talentImgs = require('./routes/talentImgs');
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


// app.use(passport.initialize());
// app.use(passport.session());
// app.use(session({ }));
const BNET_ID = process.env.CLIENT_ID;
const BNET_SECRET = process.env.CLIENT_SECRET;
// var token = process.env.TOKEN;
var wcToken = process.env.WCLOG_TOKEN;


passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://localhost:3000/auth/bnet/callback",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {

    return done(null, profile);
}));
// console.log(BnetStrategy);

var clientToken = '';
const getToken = async () => {
try {
  const response = refresh.createAccessToken();
  const json = await response;
   // console.log(json);
   clientToken = json;

} catch(error) {
  console.log(error);
  }
}
getToken();
// var token;
// console.log(clientToken.access_token);
// token = clientToken.access_token;
// const realmSearch = "https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US&access_token=" + token;
// let allNames = [];
// const getRealmNames = async realmSearch => {
//   try {
//     const response = await fetch(realmSearch);
//     const realmJson = await response.json();
//     for (var i = 0; i < realmJson.realms.length; i++) {
//       // console.log(realmJson.realms[i].name);
//       var allRnames = realmJson.realms[i].name;
//       allNames.push(allRnames);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }


// getRealmNames(realmSearch);
app.get('/', function(req, res){

  var playerObj = '';
  res.render("home", {
    playerObj: playerObj,
    // wowRealms: allNames
  });
});
app.get('/profile', function(req, res){
  res.render("profile");
});

app.get('/auth/bnet',
    passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/' }),
    function(req, res){
        console.log(accessToken);
        res.redirect('/');
    });

app.post("/auth/bnet/callback",
  passport.authenticate('bnet', { failureRedirect: '/' }),
  function(req, res){
      res.redirect('/');
});

app.post ('/wowSearch', function(req, res){

  let equipmentIds = {};
  let contextTalents = {};
  let equipmentSlot = {};
  let equipmentName = {};
  let equipmentQuality = {};
  let equipmentImages = {};
  let equipmentBonus = {};
  let equipmentSocket = {};

  var playerName = _.lowerCase(req.body.playerName);
  var playerRealm = _.lowerCase(req.body.playerRealm);

  var newName = playerName;
  var newRealm = playerRealm.replace(/\s/g, '-');
  // var playerNameParam = _.lowerCase(req.params.playerName)
  // var newS = playerName.split(' ');
  // var newName = newS[0];
  // var newRealm = newS[1];
  // console.log(newS);
  console.log(newName);
  console.log(newRealm);

  const exportToken = async () => { // hopefully this is going to refresh my token each day for client

    await getToken();
    // not sure if i should put an if statement
    var token;
    // console.log(clientToken.access_token);
    token = clientToken.access_token;



  Promise.all([
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/specializations?namespace=profile-us&locale=en_US&access_token=" + token), // TO GET PLAYER SPECILIZATION INFO TALENTS ETC.
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=" + token), //TO GET PLAYER PROFILE INFO
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/equipment?namespace=profile-us&locale=en_US&access_token=" + token), // TO GET PLAYER EQUIPMENT INFO
    fetch("https://us.api.blizzard.com/data/wow/media/item/"+equipmentIds+"?namespace=static-us&locale=en_US&access_token=" + token), // FOR PLAYER EQUIPEMENT MEDIA PICTURES?? MIGHT NOT ACTUALLY BE USING THIS
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/character-media?namespace=profile-us&locale=en_US&access_token=" + token), //THIS IS FOR PLAYER AVATAR PICTURE
    fetch("https://us.api.blizzard.com/data/wow/talent/index?namespace=static-us&locale=en_US&access_token=" + token)
  ]).then(function(responses){
    return Promise.all(responses.map(function(response){
      return response.json();
    }));
  }).then(function(data){
    var playerName = _.lowerCase(req.body.playerName);
    // // console.log(playerName);
    // var newS = playerName.split(' ');
    // var newName = newS[0];
    // var newRealm = newS[1];
    // console.log(newName);
    var newName = playerName;
    var newRealm = playerRealm.replace(/\s/g, '-');


    // PLAYER EQUIPMENT
    var equipment = data[2].equipped_items;
    var equipSlot = [];
    var equipName = [];
    var equipQuality = [];
    var socketEquip = [];
    var equipImages = [];
    var equipBonus = [];
    var playerAvatar = data[4].assets[0].value;
    var playerMainAvatar = data[4].assets[2].value;
    // console.log(playerMainAvatar);

    for (var i = 0; i < equipment.length; i++) {
      var slot = equipment[i].slot.name;
      var itemName = equipment[i].name;
      var quality = equipment[i].quality.name;
      var itemId = equipment[i].item.id;
      var itemBonus = equipment[i].bonus_list;
      var socket = equipment[i].sockets;

      if(socket){
      var socketSlot = "&gems=" + socket[0].item.id;
          socketEquip.push(socketSlot);
      }
      equipSlot.push(slot);
      equipName.push(itemName);
      equipQuality.push(quality);
      equipImages.push(itemId);

      if(itemBonus){
        equipBonus.push(itemBonus.join(':'));
      }
    }

    equipmentSlot = equipSlot;
    equipmentName = equipName;
    equipmentQuality = equipQuality;
    equipmentIds = equipImages;
    equipmentBonus = equipBonus;
    equipmentSocket = socketEquip;


//ITEM IMAGES
    wowHeadLinks = {}
    wowHeadEquip = [];

    for (var i = 0; i < equipmentIds.length; i++) {
      // var wowHeadItems = "https://www.wowhead.com/item=" + equipmentIds[i] + "&gems=" + equipmentSocket[i] + "&bonus=" + equipmentBonus[i];
      var wowHeadItems = "https://www.wowhead.com/item=" + equipmentIds[i] + "&bonus=" + equipmentBonus[i];
      wowHeadEquip.push(wowHeadItems);
    }
    wowHeadLinks = wowHeadEquip;

//PLAYER TALENTS
    let pickedTalents = [];
    let spellImgs = [];
    let spellToolTips = [];
    let pvpTalents = [];
    for (var i = 0; i < data[0].specializations.length; i++) {

      var specName = data[0].active_specialization.name;
      var character = data[0].character.name;

          if(specName === data[0].specializations[i].specialization.name){
            for (var x = 0; x < data[0].specializations[i].talents.length; x++) {
                  var toolTips = data[0].specializations[i].talents[x].spell_tooltip.spell.id;
                  var toolTipName = data[0].specializations[i].talents[x].spell_tooltip.spell.name;
                  let picked = data[0].specializations[i].talents[x].talent.name;

                  pickedTalents.push(toolTipName);
                  spellToolTips.push(toolTips);
            }

            for (var z = 0; z < data[0].specializations[i].pvp_talent_slots.length; z++) {
              console.log(data[0].specializations[i].pvp_talent_slots[z].selected.spell_tooltip.spell.id);
              var pvpTal = data[0].specializations[i].pvp_talent_slots[z].selected.spell_tooltip.spell.id;
              pvpTalents.push(pvpTal);
            }
        }
    }

    contextTalents = pickedTalents;
    console.log(contextTalents);

    if(data[1].guild){
      var guild = data[1].guild.name;
    }
    if(guild){
      var guildName = _.lowerCase(data[1].guild.name);
      var guildLink = guildName.replace(/\s/g, '-');
    }

//GUILD INFO
    var guildUrl  = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"?namespace=profile-us&locale=en_US&access_token=" + token;
    var guildRoster = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"/roster?namespace=profile-us&locale=en_US&access_token=" + token;
    var guildShit;

//GUILD PROFILE API
    const getData = async guildUrl => {
      try {
          const response = await fetch(guildUrl);
          const json = await response.json();
          guildShit = json;
          // console.log(guildShit);
      } catch (error) {
        console.log(error);
      }
    };
//GUILD ROSTER API
    var newGuildRoster = {}
    const getGuildRoster = async guildRoster => {
      try {
          const response = await fetch(guildRoster);
          const json = await response.json();
          gRoster = json;

      } catch (error) {
        console.log(error);
      }
    };

//PLAYER PVP RATING API
  var twoRating = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/2v2?namespace=profile-us&locale=en_US&access_token=" + token;
  let ratingTwo;
  let rating;
  let ratingRbg;
  const getTwoRating = async twoRating => {
  try {
    const response = await fetch(twoRating);
    const json = await response.json();
     ratingTwo = json;
     // console.log(ratingTwo);
  } catch(error) {
    console.log(error);
  }
};
  var pvpRating = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/3v3?namespace=profile-us&locale=en_US&access_token=" + token;

  const getRating = async pvpRating => {
    try {
      const response = await fetch(pvpRating);
      const json = await response.json();
       rating = json;

    } catch(error) {
      console.log(error);
    }
  };
  var rbgRating = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/rbg?namespace=profile-us&locale=en_US&access_token=" + token;
  const getRbgRating = async rbgRating => {
    try {
      const response = await fetch(rbgRating);
      const json = await response.json();
       ratingRbg = json;

    } catch(error) {
      console.log(error);
    }
  };

    getData(guildUrl);
    getGuildRoster(guildRoster);
    getRating(pvpRating);
    getRbgRating(rbgRating);
    getTwoRating(twoRating);

// waits for getData to finish before running
    const guildInfo = async () => {
      await getData(guildUrl);
      await getGuildRoster(guildRoster);
      await getRating(pvpRating);
      await getRbgRating(rbgRating);
      await getTwoRating(twoRating);

      let roster = [];
      let guildMembers = guildShit.member_count;
      let guildPoints = guildShit.achievement_points;
      // console.log(guildMembers);
        if(guildMembers > 1) {
          for (var i = 0, l = gRoster.members.length; i < l; i++) {
            var rosterNames = gRoster.members[i];
            let memberNames = rosterNames.character.name;
            roster.push(memberNames);
          }
        }
        newGuildRoster = roster;

      //PVP RATING WIN PERCENTAGE VARIABLES
      let threeRating = rating.rating;
      let twoCr = ratingTwo.rating;
      let rbgCr = ratingRbg.rating;

      let twoMatches = ratingTwo.season_match_statistics.played;
      let twoWins = ratingTwo.season_match_statistics.won;
      let twoLost = ratingTwo.season_match_statistics.lost;
      let twoWinRate = (twoWins / twoMatches) * 100;
      let roundedTwos = _.round(twoWinRate, 1);

      let threeMatches = rating.season_match_statistics.played;
      let threeWins = rating.season_match_statistics.won;
      let threeLost = rating.season_match_statistics.lost;
      let threeWinRate = (threeWins / threeMatches) * 100;
      let roundedThrees = _.round(threeWinRate, 1)

      let rbgMatches = ratingRbg.season_match_statistics.played;
      let rbgWins = ratingRbg.season_match_statistics.won;
      let rbgLost = ratingRbg.season_match_statistics.lost;
      let rbgWinRate = (rbgWins / rbgMatches) * 100;
      let roundedRbgs = _.round(rbgWinRate, 1);

      res.render("profile", {
                characterName: data[1].name,
                faction: data[1].faction.name,
                race: data[1].race.name,
                characterClass: data[1].character_class.name,
                spec: data[1].active_spec.name,
                realm: data[1].realm.name,
                guild: guild,
                level: data[1].level,
                points: data[1].achievement_points,
                itemLevel: data[1].equipped_item_level,
                talents: data[1].specializations,
                contextTalents: contextTalents,
                equipmentSlot: equipmentSlot,
                equipmentName: equipmentName,
                equipmentQuality: equipmentQuality,
                itemRender: equipmentIds,
                equipmentImages: wowHeadLinks,
                avatar: playerAvatar,
                avatarMain: playerMainAvatar,
                guildMembers: guildMembers,
                guildPoints: guildPoints,
                guildRoster: newGuildRoster,
                threeRating: threeRating,
                twoCr: twoCr,
                rbgCr: rbgCr,
                twoMatches: twoMatches,
                twoWins: twoWins,
                twoLost: twoLost,
                threeMatches: threeMatches,
                threeWins: threeWins,
                threeLost: threeLost,
                rbgMatches: rbgMatches,
                rbgWins: rbgWins,
                rbgLost: rbgLost,
                twoWinRate: roundedTwos,
                threeWinRate: roundedThrees,
                rbgWinRate: roundedRbgs,
                spellIds: spellToolTips,
                pvpTal: pvpTalents

      });
    }
    guildInfo();

  })
  .catch(function(error){
      console.log(error);
      res.send("<h2>Name is not found!! please check if the name is correct and the realm</h2>");
  });
}
exportToken();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
  console.log('wow server started on 3000');
});

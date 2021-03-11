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

app.get("/dropdown", function(req, res){
  res.render("dropdown");
});

app.get('/', function(req, res){
    var playerObj = '';
    res.render("home", {playerObj: playerObj,});
});

app.get('/error', function(req, res){
  res.render("error");
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
  // let equipmentName = {};
  let equipmentQuality = {};
  let equipmentImages = {};
  let equipmentBonus = {};
  let equipmentSocket = {};

  var playerRealm = _.lowerCase(req.body.playerRealm);
  var playerName = req.body.playerName;
  var newName = playerName.toLowerCase().replace(/\s/g, '');
  var newRealm = playerRealm.replace(/\s/g, '');
  // var newS = playerName.split(' ');
  // var newName = newS[0];
  // var newRealm = newS[1];
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
    // fetch("https://us.api.blizzard.com/data/wow/media/item/"+equipmentIds+"?namespace=static-us&locale=en_US&access_token=" + token), // FOR PLAYER EQUIPEMENT MEDIA PICTURES?? MIGHT NOT ACTUALLY BE USING THIS
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/statistics?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/character-media?namespace=profile-us&locale=en_US&access_token=" + token), //THIS IS FOR PLAYER AVATAR PICTURE
    // fetch("https://us.api.blizzard.com/data/wow/talent/index?namespace=static-us&locale=en_US&access_token=" + token)
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/2v2?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/3v3?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/pvp-bracket/rbg?namespace=profile-us&locale=en_US&access_token=" + token)

  ]).then(function(responses){
    return Promise.all(responses.map(function(response){
      return response.json();
    }));
  }).then(function(data){
    // var newS = playerName.split(' ');
    // var newName = newS[0];
    // var newRealm = newS[1];

    var playerName = req.body.playerName;
    var newName = playerName.toLowerCase().replace(/\s/g, '');
    var newRealm = playerRealm.replace(/\s/g, '-');

    //COVENANT
    var covenant;
    var renown;
    if(data[1].covenant_progress){
        covenant = data[1].covenant_progress.chosen_covenant.name;
        renown = data[1].covenant_progress.renown_level;
    }

    //PLAYER STATS
      var crit = Math.round((data[3].melee_crit.value + Number.EPSILON) * 100) / 100;
      var haste = Math.round((data[3].melee_haste.value + Number.EPSILON) * 100) / 100;
      var mastery = Math.round((data[3].mastery.value + Number.EPSILON) * 100) / 100;
      var versatility = Math.round((data[3].versatility_damage_done_bonus + Number.EPSILON) * 100) / 100;

    // PLAYER EQUIPMENT
    var equipment = data[2].equipped_items;
    var equipSlot = [];
    // var equipName = [];
    var equipQuality = [];
    var socketEquip = [];
    var equipImages = [];
    var equipBonus = [];
    var playerAvatar = data[4].assets[0].value;
    var playerMainAvatar = data[4].assets[2].value;
    var socketArray = [];

    // console.log(equipment);
    for (var i = 0; i < equipment.length; i++) {
      var slot = equipment[i].slot.name;
      // var itemName = equipment[i].name;
      var quality = equipment[i].quality.name;
      var itemId = equipment[i].item.id;
      var itemBonus = equipment[i].bonus_list;
      var socket = equipment[i].sockets;

      if(socket){
        var socketSlot = socket[0].item.id;
            socketEquip.push(socketSlot);
              // console.log(socketEquip);
      }

      equipSlot.push(slot); //for equipement slot names Head, shoulders etc
      equipQuality.push(quality);
      equipImages.push(itemId);

      if(itemBonus){
        equipBonus.push(itemBonus.join(':'));
      }
    }

    equipmentSlot = equipSlot;
    equipmentQuality = equipQuality;
    equipmentIds = equipImages;
    equipmentBonus = equipBonus;
    equipmentSocket = socketEquip;

//ITEM IMAGES
    wowHeadLinks = {}
    wowHeadEquip = [];

    for (var i = 0; i < equipment.length; i++) {
      // if(equipment[i].sockets){
      //       var wowHeadItemsWithSock = "https://www.wowhead.com/item=" + equipmentIds[i] + "&gems=" + equipmentSocket[i] + "&bonus=" + equipmentBonus[i];
      //           console.log(wowHeadItemsWithSock);
      // }
  // }
      var wowHeadItems = "https://www.wowhead.com/item=" + equipmentIds[i] + "&bonus=" + equipmentBonus[i];
      wowHeadEquip.push(wowHeadItems);
    }
    wowHeadLinks = wowHeadEquip;
    console.log(wowHeadLinks);

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

//GUILD INFO
    if(data[1].guild){
      var guild = data[1].guild.name;
    }
    if(guild){
      var guildName = _.lowerCase(data[1].guild.name);
      var guildLink = guildName.replace(/\s/g, '-');

    }


    var guildUrl  = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"?namespace=profile-us&locale=en_US&access_token=" + token;
    var guildRoster = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"/roster?namespace=profile-us&locale=en_US&access_token=" + token;
    var guildStuff;

//GUILD PROFILE API
    const getData = async guildUrl => {
      try {
          const response = await fetch(guildUrl);
          const json = await response.json();
          guildStuff = json;
          // console.log(guildStuff);
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

    // console.log(data[5].rating);
//PLAYER PVP RATING API

    let ratingTwo = data[5];
    let rating = data[6];
    let ratingRbg = data[7];

    getData(guildUrl);
    getGuildRoster(guildRoster);

// waits for getData to finish before running
    const guildInfo = async () => {
      await getData(guildUrl);
      await getGuildRoster(guildRoster);

      let roster = [];
      let guildMembers = guildStuff.member_count;
      let guildPoints = guildStuff.achievement_points;

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
      let twoMatches;
      let twoWins;
      let twoLost;
      let twoWinRate;
      let roundedTwos;
      let threeMatches;
      let threeWins;
      let threeLost;
      let threeWinRate;
      let roundedThrees;
      let rbgMatches;
      let rbgWins;
      let rbgLost;
      let rbgWinRate;
      let roundedRbgs;

      if(twoCr > 0){
            twoMatches = ratingTwo.season_match_statistics.played;
            twoWins = ratingTwo.season_match_statistics.won;
            twoLost = ratingTwo.season_match_statistics.lost;
            twoWinRate = (twoWins / twoMatches) * 100;
            roundedTwos = _.round(twoWinRate, 1);
        }
      if(threeRating > 0){
         threeMatches  = rating.season_match_statistics.played;
         threeWins     = rating.season_match_statistics.won;
         threeLost     = rating.season_match_statistics.lost;
         threeWinRate  = (threeWins / threeMatches) * 100;
         roundedThrees = _.round(threeWinRate, 1)
      }
      if(rbgCr > 0 ){
         rbgMatches   = ratingRbg.season_match_statistics.played;
         rbgWins      = ratingRbg.season_match_statistics.won;
         rbgLost      = ratingRbg.season_match_statistics.lost;
         rbgWinRate   = (rbgWins / rbgMatches) * 100;
         roundedRbgs  = _.round(rbgWinRate, 1);
      }


      res.render("profile", {
                characterName: data[1].name,
                faction: data[1].faction.name,
                race: data[1].race.name,
                characterClass: data[1].character_class.name,
                spec: data[1].active_spec.name,
                realm: data[1].realm.name,
                covenant: covenant,
                renown: renown,
                guild: guild,
                level: data[1].level,
                points: data[1].achievement_points,
                itemLevel: data[1].equipped_item_level,
                crit: crit,
                haste: haste,
                mastery: mastery,
                versatility: versatility,
                talents: data[1].specializations,
                contextTalents: contextTalents,
                equipmentSlot: equipmentSlot,
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
      // res.send("<h2>Name is not found!! please check if the name is correct and the realm</h2>");
      res.redirect("/error");
  });
}
exportToken();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
  console.log('wow server started on 3000');
});

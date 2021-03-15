require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const ejs = require('ejs');
const flash = require('connect-flash');
// const session = require('cookie-session');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const request = require('request');
const fetch = require('node-fetch');
var _ = require('lodash');

var BnetStrategy = require('passport-bnet').Strategy;
const Character = require('./models/Profile');
const User = require('./models/User');
const refresh = require('./routes/token');
const keys = require('./config/key');



mongoose.connect(keys.mongoUri, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));

// const BNET_ID = process.env.CLIENT_ID;
// const BNET_SECRET = process.env.CLIENT_SECRET;

app.use(cookieParser());
app.use(session({ secret: keys.SECRET,
                  saveUninitialized: true,
                  resave: false,
                  store: MongoStore.create({
                  mongoUrl: keys.mongoUri,
                  autoRemove: 'native' // Default
                  })
                 }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new BnetStrategy({
    clientID: keys.BNET_ID,
    clientSecret: keys.BNET_SECRET,
    callbackURL: keys.callback_URL,
    scope: "wow.profile",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {

    return done(null, profile);
}));

app.use(function (req, res, next) { // need this in order for the login in button to switch back and forth from logout this let the template access isAuthenticated
 res.locals.isAuthenticated = req.isAuthenticated();
 next();
});
app.use(function (req, res, next) { // need this in order for the login in button to switch back and forth from logout this let the template access isAuthenticated
 res.locals.isAuthenticated = req.isAuthenticated();
 next();
});

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



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
app.use('/', require('./config/router.js'));

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) { return next(); }
  res.redirect("/");
}

app.get('/auth/bnet',
    passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/' }),
    function(req, res){
      // console.log(req.user.battletag);
      var battletag = req.user.battletag;
      // var btParam = req.params.battletag
        if(req.isAuthenticated()){
          const user = new User({
            battletag: req.body.battletag
          });
          user.save();
          res.redirect('/dropdown');
        } else {
          res.redirect("/");
        }

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
app.get('/dropdown', ensureAuthenticated,function(req, res){
          // var battletag = req.query.battletag
          if(req.isAuthenticated()){
            // console.log(req);
            var battletag = req.user.battletag;
            var userToken = req.user.token;
            var userInfo = 'https://us.api.blizzard.com/profile/user/wow?namespace=profile-us&locale=en_US&access_token=' + userToken;

            var allCharNames = {};
            var allCharPhotos = {};
            const getUserInfo = async userInfo => {
              try
              {
                  var wowCharNames = [];
                  const response = await fetch(userInfo);
                  const userJson = await response.json();
                  // console.log(userJson.wow_accounts[0].characters);
                  // console.log(userJson.wow_accounts[0]);
                  var charPhotoArray = [];
                  for (var i = 0; i < userJson.wow_accounts[0].characters.length; i++) {
                    // console.log(userJson.wow_accounts[0].characters[i]);
                    if(userJson.wow_accounts[0].characters[i].level > 20){
                    var charNames = new Character({
                      name: userJson.wow_accounts[0].characters[i].name,
                      realm: userJson.wow_accounts[0].characters[i].realm.name,
                      class: userJson.wow_accounts[0].characters[i].playable_class.name,
                      race: userJson.wow_accounts[0].characters[i].playable_race.name,
                      level: userJson.wow_accounts[0].characters[i].level,
                      faction: userJson.wow_accounts[0].characters[i].faction.name,
                      slug: userJson.wow_accounts[0].characters[i].realm.slug
                    });
                    var lowerCharNames = _.lowerCase(charNames.name);
                    var characterAvatars = "https://us.api.blizzard.com/profile/wow/character/"+charNames.slug+"/"+lowerCharNames+"/character-media?namespace=profile-us&locale=en_US&access_token=" + userToken;
                    // console.log(characterAvatars);
                    var characterPhotos = "https://us.api.blizzard.com/profile/wow/character/"+charNames.slug+"/"+lowerCharNames+"/character-media?namespace=profile-us&locale=en_US&access_token=" + userToken;
                    // console.log(characterPhotos);
                    wowCharNames.push(charNames);
                    charPhotoArray.push(characterPhotos);
                    // charNames.save(function(err){
                    //   if(err){
                    //     console.log(err);
                    //   }
                    // });
                  }
                  }
                  allCharNames = wowCharNames;
                  allCharPhotos = charPhotoArray;

              } catch (error) {
                  console.log(error);
              }
            };
            getUserInfo(userInfo);

          var avatarPhotos = {};

          const profileInfo = async () => {
                  await getUserInfo(userInfo);
                let avatarRequest = allCharPhotos.map(allCharPhoto => fetch(allCharPhoto));
                Promise.all(avatarRequest)
                .then(responses => {
                  return Promise.all(responses.map(function(response){
                    if(response.status === 200){
                        return response.json();
                    }
                  }));
                })
                .then(function(photoData){
                    // var filtered = photoData.filter(function(x){
                    //   return x !== undefined;
                    // });
                    var applyValues = [];
                    for (var i = 0; i < photoData.length; i++) {
                      var assetValues = photoData[i].assets[0].value;
                      applyValues.push(assetValues);
                    }
                    // for (var i = 0; i < filtered.length; i++) {
                    //   var assetValues = filtered[i].assets[0].value;
                    //   applyValues.push(assetValues);
                    // }
                    avatarPhotos = applyValues;
                    res.render('dropdown', {
                      battletag: battletag,
                      wowChars: allCharNames,
                      avatarPhotos: avatarPhotos
                    });
                })
                .catch(function(error){
                  console.log(error);
                });
                }
                profileInfo();
          } else {
            res.redirect("/");
          }
});

app.post('/dropdown', function(req, res){
    let errors = [];
  const character = new Character({
    name: req.body.name,
    realm: req.body.realm,
    class: req.body.class,
    level: req.body.level,
    race: req.body.race,
    faction: req.body.faction
    // slug: req.body.slug,
    // media: req.body.avatarPhoto
  });
  Character.findOne({name: req.body.name, realm: req.body.realm}).then(char => {
    if(!char){
      character.save(function(err){
        if(err){
          console.log(err)
        } else {
          res.redirect("/dropdown");
        }
      })
    } else if(char) {
      errors.push( {msg:"Character already added"});
      console.log(errors);
      res.redirect("/dropdown");
    }

  })



});





app.get('/logout', (req, res) => {

  req.logout();
  // req.session.destroy();
  // req.flash('success_msg', 'You are logged out');
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
  // console.log(newName);
  // console.log(newRealm);

  const exportToken = async () => { // hopefully this is going to refresh my token each day for client

    await getToken();
    // not sure if i should put an if statement
    var token;
    // console.log(clientToken.access_token);
    token = clientToken.access_token;
    console.log(token);

  Promise.all([
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/specializations?namespace=profile-us&locale=en_US&access_token=" + token), // TO GET PLAYER SPECILIZATION INFO TALENTS ETC.
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=" + token), //TO GET PLAYER PROFILE INFO
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/equipment?namespace=profile-us&locale=en_US&access_token=" + token), // TO GET PLAYER EQUIPMENT INFO
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/statistics?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/character-media?namespace=profile-us&locale=en_US&access_token=" + token), //THIS IS FOR PLAYER AVATAR PICTURE
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
    console.log(data[4]);
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
      console.log(data[0].specializations.specialization);
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

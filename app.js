require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const request = require('request');
const fetch = require('node-fetch');
var _ = require('lodash');
const passport = require('passport');
var BnetStrategy = require('passport-bnet').Strategy;

// const getData = require('./modules/fetchMod');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


// app.use(passport.initialize());
// app.use(passport.session());
// app.use(session({ }));
var BNET_ID = process.env.CLIENT_ID;
var BNET_SECRET = process.env.CLIENT_SECRET;
var token = process.env.TOKEN;

passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://localhost:3000/auth/bnet/callback",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));


app.get('/spec', function(req, res){
var specUrl = "https://us.api.blizzard.com/profile/wow/character/tichondrius/oledeepo/specializations?namespace=profile-us&locale=en_US&access_token=US3ZTYQAe8chSKLT7PUl6vDIldIxYYt71V";
var contextTalents = {};

  request(specUrl, function(error, response, body){
    var specInfo = JSON.parse(body);
    var pickedTalents = [];

    for (var i = 0; i < specInfo.specializations.length; i++) {
        // console.log(specInfo.specializations[0].talents[i]);
        var specName = specInfo.active_specialization.name;
        var character = specInfo.character.name;
        console.log(character);
          // specInfo.specializations.forEach((t) => {
          //   console.log(t.specialization.name);
          // });
              // console.log(specInfo.specializations);
          for (var x = 0; x < specInfo.specializations[0].talents.length; x++) {
            // console.log(specInfo.specializations[0].talents[x].talent.name);
            var picked = specInfo.specializations[0].talents[x].talent.name;
            pickedTalents.push(picked);
            // console.log(picked);
          }
        var picked2 = specInfo.specializations[1].talents[i].talent.name; // this is giviing me vengeance talents
    }
    contextTalents = pickedTalents
    res.render('spec', {contextTalents: contextTalents, specName: specName, character: character});
  });
});

app.get('/', function(req, res){

  // var url = "https://us.api.blizzard.com/profile/wow/character/tichondrius/oledeepo?namespace=profile-us&locale=en_US&access_token=" + token;
  // var equipmentSlot = {};
  // var equipmentName = {};
  // var equipmentQuality = {};
  // request(url, function(error, response, body){
  //   var profile = JSON.parse(body);
  //
  //   var characterName = '';
  //   var faction = '';
  //   var race = ' ';
  //   var characterClass = '';
  //   var spec = '';
  //   var realm = '';
  //   var guild = '';
  //   var level = '';
  //   var achievementPoints = '';
  //   var equippedItemLevel = '';
  //   var specializations = '';
  //   var contextTalents = '';
  //   var equipSlot = [];
  //   var equipName = [];
  //   var equipQuality = [];
  //   var playerAvatar = [];
  //   var twoCr = '';
  //   var threeRating = '';
  //   var rbgCr = '';
  //   var twoMatches = '';
  //   var threeMatches = '';
  //   var rbgMatches = '';
  //   var twoWins = '';
  //   var threeWins = '';
  //   var rbgWins = '';
  //   var twoLost = '';
  //   var threeLost = '';
  //   var rbgLost = '';
  //
  //
  //   // console.log(profile);
  //   res.render('dashboard',
  //   {
  //       characterName: characterName,
  //       faction: faction,
  //       race: race,
  //       characterClass: characterClass,
  //       spec: spec,
  //       realm: realm,
  //       guild: guild,
  //       level: level,
  //       points: achievementPoints,
  //       itemLevel: equippedItemLevel,
  //       talents: specializations,
  //       contextTalents: contextTalents,
  //       contextTalents: contextTalents,
  //       equipmentSlot: equipmentSlot,
  //       equipmentName: equipmentName,
  //       equipmentQuality: equipmentQuality,
  //       avatar: playerAvatar,
  //       threeRating: threeRating,
  //       twoCr: twoCr,
  //       rbgCr: rbgCr,
  //       twoMatches: twoMatches,
  //       twoWins: twoWins,
  //       twoLost: twoLost,
  //       threeMatches: threeMatches,
  //       threeWins: threeWins,
  //       threeLost: threeLost,
  //       rbgMatches: rbgMatches,
  //       rbgWins: rbgWins,
  //       rbgLost: rbgLost,
  //       twoWinRate: '',
  //       threeWinRate: '',
  //       rbgWinRate: ''
  //
  //     });
  // });
  res.render("home");

});

// app.get("/items", function(req, res){
//     let equipmentIds = {};
//     // var playerName = _.lowerCase(req.body.playerName);
//     // var newName = playerName.replace(/\s/g, '');
//     // var realmName = _.lowerCase(req.body.realmName);
//     // var newRealm = realmName.replace(/\s/g, '');
//       // console.log(mediaLink);
//       let equipImages = [];
//       let equippedIds = [];
//       let equipmentRenders = {};
//       // <a class="epic" href="//www.wowhead.com/item=180106" rel="pcs=180106:183040:180920:183033:178795:175883:178832:183005:178819:178731:178871:178870:184052:175884:182407:179328&amp;spec=577&amp;ilvl=184&amp;transmog=112883&amp;bonus=6807:6652:6935:1498:6646&amp;gems=173129:&amp;">
//       // Vicious Surge Faceguard
//       // </a>
//
//     fetch("https://us.api.blizzard.com/profile/wow/character/tichondrius/oledeepo/equipment?namespace=profile-us&locale=en_US&access_token=USiHuTIJ086HaF5AhUrtVmzgAB8tQxBHpa")
//     .then(response => response.json())
//     .then(dataItem => {
//         var equipment = dataItem.equipped_items;
//         // // console.log(equipment);
//         //
//         //   for (var i = 0; i < equipment.length; i++) {
//         //     var itemId = equipment[i].item.id;
//             // equipImages.push(dataItem);
//           // }
//           // var equipment = equipImages[0].equipped_items;
//           // console.log(equipment.item);
//
//            for (var i = 0; i < equipment.length; i++) {
//              var itemId = equipment[i].item.id;
//
//              equippedIds.push(itemId);
//           }
//            // console.log(equippedIds);
//            equipmentIds = equippedIds;
//            console.log(equipmentIds);
//              let urls = [];
//            for (var i = 0; i < equipment.length; i++) {
//
//                 var itemImage = "https://us.api.blizzard.com/data/wow/media/item/"+ equipmentIds[i] +"?namespace=static-us&locale=en_US&access_token=USiHuTIJ086HaF5AhUrtVmzgAB8tQxBHpa";
//                 renderImages = itemImage;
//                   // console.log(renderImages);
//                 equipmentImages = renderImages;
//
//
//                 fetch("https://us.api.blizzard.com/data/wow/media/item/"+ equipmentIds[i] +"?namespace=static-us&locale=en_US&access_token=USiHuTIJ086HaF5AhUrtVmzgAB8tQxBHpa")
//                   .then(response => response.json())
//                   .then(dataItem => {
//
//                     var newItem = dataItem.assets[0].value;
//                     urls.push(newItem);
//                     // console.log(urls);
//                     equipmentRenders = urls;
//                   })
//                   // console.log(equipmentRenders);
//
//
//             }
//             res.render("items", {equipmentR: urls});
//
//
//     }).catch(function(error){
//           console.log(error);
//           res.send("<h2>Name is not found!! please check if the name is correct and the realm</h2>");
//       });
//
// });
app.get('/auth/bnet',
    passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/home' }),
    function(req, res){
        res.redirect('/');
    });
app.get("/home", function(req, res){

  res.render("home");
});

app.post("/auth/bnet/callback",
  passport.authenticate('bnet', { failureRedirect: '/home' }),
  function(req, res){
      res.redirect('/');
});



app.post ('/', function(req, res){

  let equipmentIds = {};
  let contextTalents = {};
  let equipmentSlot = {};
  let equipmentName = {};
  let equipmentQuality = {};
  let equipmentImages = {};
  let equipmentBonus = {};
  let equipmentSocket = {};

  var playerName = _.lowerCase(req.body.playerName);
  var newName = playerName.replace(/\s/g, '');
  var realmName = _.lowerCase(req.body.realmName);
  var newRealm = realmName.replace(/\s/g, '');

  Promise.all([
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/specializations?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/equipment?namespace=profile-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/data/wow/media/item/"+equipmentIds+"?namespace=static-us&locale=en_US&access_token=" + token),
    fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/character-media?namespace=profile-us&locale=en_US&access_token=" + token)
  ]).then(function(responses){
    return Promise.all(responses.map(function(response){
      return response.json();
    }));
  }).then(function(data){
    //log the data to console would do something with both sets of data here
    var playerName = _.lowerCase(req.body.playerName);
    var newName = playerName.replace(/\s/g, '');
    var realmName = _.lowerCase(req.body.realmName);
    var newRealm = realmName.replace(/\s/g, '');

    var equipment = data[2].equipped_items;
    var equipSlot = [];
    var equipName = [];
    var equipQuality = [];
    var socketEquip = [];
    var equipImages = [];
    var equipBonus = [];
    var playerAvatar = data[4].assets[0].value;

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
    var pickedTalents = [];

    for (var i = 0; i < data[0].specializations.length; i++) {
      var specName = data[0].active_specialization.name;
      var character = data[0].character.name;
      for (var x = 0; x < data[0].specializations[0].talents.length; x++) {
            var picked = data[0].specializations[0].talents[x].talent.name;
            pickedTalents.push(picked);
      }
    }
    contextTalents = pickedTalents;

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
     console.log(ratingTwo);
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

      // console.log(guildShit);
      let roster = [];
      let guildMembers = guildShit.member_count;
      let guildPoints = guildShit.achievement_points;

      for (var i = 0, l = gRoster.members.length; i < l; i++) {
        var rosterNames = gRoster.members[i];
        let memberNames = rosterNames.character.name;
        roster.push(memberNames);
      }
      newGuildRoster = roster;
      // console.log(newGuildRoster);
      let threeRating = rating.rating;
      let twoCr = ratingTwo.rating;
      let rbgCr = ratingRbg.rating;
      // console.log(twoCr);
      let twoMatches = ratingTwo.season_match_statistics.played;
      let twoWins = ratingTwo.season_match_statistics.won;
      let twoLost = ratingTwo.season_match_statistics.lost;
      let twoWinRate = (twoWins / twoMatches) * 100;
      let roundedTwos = _.round(twoWinRate, 1);
      console.log(roundedTwos);

      let threeMatches = rating.season_match_statistics.played;
      let threeWins = rating.season_match_statistics.won;
      let threeLost = rating.season_match_statistics.lost;
      let threeWinRate = (threeWins / threeMatches) * 100;
      let roundedThrees = _.round(threeWinRate, 1)
      console.log(roundedThrees);

      let rbgMatches = ratingRbg.season_match_statistics.played;
      let rbgWins = ratingRbg.season_match_statistics.won;
      let rbgLost = ratingRbg.season_match_statistics.lost;
      let rbgWinRate = (rbgWins / rbgMatches) * 100;
      let roundedRbgs = _.round(rbgWinRate, 1);
      console.log(roundedRbgs);

      // console.log(twoMatches);
      res.render("dashboard", {
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
                rbgWinRate: roundedRbgs

      });
    }

    guildInfo();

  })
  .catch(function(error){
      console.log(error);
      res.send("<h2>Name is not found!! please check if the name is correct and the realm</h2>");
  });
});



app.listen(3000, function(){
  console.log('wow server started on 3000');
});

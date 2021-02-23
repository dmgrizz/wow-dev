// require('dotenv').config()
// const bodyParser = require('body-parser');
// const fetch = require('node-fetch');
// var _ = require('lodash');
//
// function guildMod(res, req){
//   var playerName = _.lowerCase(req.body.playerName);
//   var newS = playerName.split(' ');
//   var newName = newS[0];
//   var newRealm = newS[1];
//
//   var guildUrl  = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"?namespace=profile-us&locale=en_US&access_token=" + token;
//   var guildRoster = "https://us.api.blizzard.com/data/wow/guild/"+newRealm+"/"+guildLink+"/roster?namespace=profile-us&locale=en_US&access_token=" + token;
//   var guildShit;
//   //GUILD PROFILE API
//   const getData = async guildUrl => {
//     try {
//         const response = await fetch(guildUrl);
//         const json = await response.json();
//         guildShit = json;
//         console.log(guildShit);
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   //GUILD ROSTER API
//   var newGuildRoster = {}
//   const getGuildRoster = async guildRoster => {
//     try {
//         const response = await fetch(guildRoster);
//         const json = await response.json();
//         gRoster = json;
//
//     } catch (error) {
//       console.log(error);
//     }
//   };
// }
//
//
//
//
// module.exports = guildMod;

const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../../routes/getToken');
const User = require('../../models/User');
const Character = require('../../models/Profile');
const ensureAuthenticated = require('../../middlewares/authenticated');


module.exports = app => {
  app.get('/charPick', ensureAuthenticated,function(req, res) {

            if(req.isAuthenticated()) {
              var battletag = req.user.battletag;
              var userToken = req.user.token;
              var userInfo = 'https://us.api.blizzard.com/profile/user/wow?namespace=profile-us&locale=en_US&access_token=' + userToken;

              var allCharNames = {};
              var allCharPhotos = {};

              const getUserInfo = async userInfo => {
                try
                {
                    var wowCharNames = [];
                    var charPhotoArray = [];

                    const response = await fetch(userInfo);
                    const userJson = await response.json();

                    for (var i = 0; i < userJson.wow_accounts[0].characters.length; i++) {
                      if(userJson.wow_accounts[0].characters[i].level === 60) {
                        var charNames = new Character({
                          name: userJson.wow_accounts[0].characters[i].name,
                          realm: userJson.wow_accounts[0].characters[i].realm.name,
                          class: userJson.wow_accounts[0].characters[i].playable_class.name,
                          race: userJson.wow_accounts[0].characters[i].playable_race.name,
                          level: userJson.wow_accounts[0].characters[i].level,
                          faction: userJson.wow_accounts[0].characters[i].faction.name,
                          slug: userJson.wow_accounts[0].characters[i].realm.slug
                        });
                        var lowerCharNames = charNames.name.toLowerCase().replace(/\s/g, '');

                        var characterPhotos = "https://us.api.blizzard.com/profile/wow/character/"+charNames.slug+"/"+lowerCharNames+"/character-media?namespace=profile-us&locale=en_US&access_token=" + userToken;
                        wowCharNames.push(charNames);
                        charPhotoArray.push(characterPhotos);
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
            var usersChars = {};
            let filtered;

            const profileInfo = async () => {
                await getUserInfo(userInfo);
                let avatarRequest = allCharPhotos.map(allCharPhoto => fetch(allCharPhoto));
                Promise.all(avatarRequest)
                  .then(responses => {
                    return Promise.all(responses.map(function(response){
                        if(response.status === 200) {
                          return response.json();
                        }
                    }));
                  })
                  .then(function(photoData) {
                    filtered = photoData.filter(function(x){
                        return x !== undefined;
                    });

                    var applyValues = [];
                    let userSavedChars = [];
                    var savedChar;

                    for (var i = 0; i < filtered.length; i++) {
                        var assetValues = filtered[i].assets[0].value;
                        applyValues.push(assetValues);
                    }
                        avatarPhotos = applyValues;

                    User.findOne({user: req.user.body}).then(function(char) {
                        if(char.characters !== null) {
                          for (var i = 0; i < char.characters.length; i++) {
                            savedChar = char.characters[i];
                            userSavedChars.push(savedChar);
                          }
                        }

                        res.render('charPick', {
                          battletag: battletag,
                          wowChars: allCharNames,
                          avatar: avatarPhotos,
                          userSavedChars: userSavedChars
                      });
                    });
                  })
                  .catch(function(error) {
                    console.log(error);
                  });
                }
                profileInfo();
            } else {
              res.redirect("/");
            }
  });
}

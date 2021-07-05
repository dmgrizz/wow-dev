const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../../routes/getToken');
const User = require('../../models/User');
const Character = require('../../models/Profile');
const ensureAuthenticated = require('../../middlewares/authenticated');

module.exports = app => {
  app.post("/userMain", function(req, res){''

    let errors = [];
    const characterSchema = new Character({
        name: req.body.name,
        realm: req.body.realm,
        class: req.body.class,
        level: req.body.level,
        race: req.body.race,
        faction: req.body.faction,
        media: req.body.avatarPhoto,
        main: req.body.main
    });
    const userSchema = new User({
      battletag: req.body.battletag,
      characters: [characterSchema]
    });

    Character.findOne({name: req.body.name, realm: req.body.realm}).then(function(char){
      if(char){
        characterSchema.save(function(err){
          if(err){
            console.log(err)
          }
          else {
            User.findOneAndUpdate(
             { battletag: req.user.battletag },
             { $push: { characters: characterSchema  } },
            function (error, success) {
                  if (error) {
                      console.log(error);
                  } else {
                      console.log(success);
                        res.redirect("/charPick");
                  }
              });
          }
        })
      } else if(char) {
        errors.push( {msg:"Character already added"});
        console.log(errors);
        res.redirect("/charPick");
      }
    })
  });

}

const fetch = require('node-fetch');
var _ = require('lodash');
const getToken = require('../routes/getToken');
const User = require('../models/User');
const Character = require('../models/Profile');
const ensureAuthenticated = require('../middlewares/authenticated');


module.exports = app => {
  app.post('/charDelete', function(req, res) {
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

    User.findOneAndUpdate(
     { battletag: req.user.battletag },
     { $pull: { characters: { name: req.body.name } } },
    function (error, success) {
          if (error) {
              console.log(error);
          } else {
              console.log(success);
              res.redirect("/charPick");
          }
      });

    Character.findOne({name: req.body.name, realm: req.body.realm}).then(function(char){
      if(char){
        char.deleteOne(function(err){
          if(err){
            console.log(err);
          }
          else {
            console.log(char);
          }
        })
      } else if(!char) {
        errors.push( {msg:"No Character Found"});
        console.log(errors);
      }
    })
  });
}

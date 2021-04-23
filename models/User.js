const mongoose = require('mongoose');
const Character = require('../models/Profile');

const characterSchema = new mongoose.Schema({
  name: String,
  realm: String,
  class: String,
  race: String,
  level: String,
  faction: String,
  slug: String,
  media: String,
  main: String
}
);

const userSchema = new mongoose.Schema({
  battletag: String,
  characters: [characterSchema]

});
  // const Character = mongoose.model('Character', charSchema);
const User = mongoose.model('User', userSchema);

module.exports = User;
// module.exports = Character;

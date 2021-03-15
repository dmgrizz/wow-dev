const mongoose = require('mongoose');
const Character = require('../models/Profile');

const charSchema = new mongoose.Schema;



const userSchema = new mongoose.Schema({
  battletag: String,
  characters: {chars: [charSchema]}
});
  // const Character = mongoose.model('Character', charSchema);
const User = mongoose.model('User', userSchema);


module.exports = User;
// module.exports = Character;

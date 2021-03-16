const mongoose = require('mongoose');
// const { Schema } = mongoose;
// const User = require('./models/User');

const characterSchema = new mongoose.Schema({
    name: String,
    realm: String,
    class: String,
    race: String,
    level: String,
    faction: String,
    slug: String,
    media: String

}
);

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;

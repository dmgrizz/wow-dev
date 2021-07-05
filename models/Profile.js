const mongoose = require('mongoose');

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

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;

const mongoose = require('mongoose');
var _ = require('lodash');
const User = require('../models/User');
const Character = require('../models/Profile');

class UserService {
  constructor(battletag){
    this.battletag = battletag;
  }
  async getUser(battletag) {
      const user = await User.findOne({battletag: battletag});
      try {

    } catch (err) {
      console.log(err);
    }
    return user;
  }

}

// module.exports = UserService;

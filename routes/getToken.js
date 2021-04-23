require('dotenv').config();
const bodyParser = require('body-parser');
const request = require('request');
const refresh = require('../routes/token');


var clientToken = '';
const getToken = async () => {
try {
  const response = refresh.createAccessToken();
  const json = await response;
   // console.log(json);

   clientToken = json.access_token;
   // console.log(clientToken);
   return clientToken;
} catch(error) {
  console.log(error);
  }
}

module.exports = getToken;

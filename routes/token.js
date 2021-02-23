require('dotenv').config();
const bodyParser = require('body-parser');
const request = require('request');


module.exports = {
  createAccessToken(BNET_ID = process.env.CLIENT_ID, BNET_SECRET = process.env.CLIENT_SECRET, region = 'us') {
// const getToken = async (BNET_ID = process.env.CLIENT_ID, BNET_SECRET = process.env.CLIENT_SECRET, region = 'us') => {
    return new Promise((resolve, reject) => {
        let credentials = Buffer.from(`${BNET_ID}:${BNET_SECRET}`);

        const requestOptions = {
            host: `${region}.battle.net`,
            path: '/oauth/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials.toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        let responseData = '';

        function requestHandler(res) {
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                let data = JSON.parse(responseData);
                resolve(data);
                  // console.log(data.access_token);

            });

        }

        let request = require('https').request(requestOptions, requestHandler);

        request.write('grant_type=client_credentials');
        request.end();
        request.on('error', (error) => {
            reject(error);
        });
    });

  }
}

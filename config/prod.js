module.exports = {
  BNET_ID: process.env.CLIENT_ID,
  BNET_SECRET: process.env.CLIENT_SECRET,
  SECRET: process.env.SECRET,
  mongoUri: process.env.mongoUri,
  callback_URL: 'https://wow-dev.herokuapp.com/auth/bnet/callback/'
}

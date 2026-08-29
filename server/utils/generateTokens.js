// Token generation lives on the User model itself:
//   user.generateAccessToken()
//   user.generateRefreshToken()
// See models/User.js. Cookie options and refresh verification live in
// services/token.service.js. This file is intentionally unused.
module.exports = {};

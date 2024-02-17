const JWT = require('jsonwebtoken');
const createError = require('http-errors');
// const client = require('./init_redis')

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: '1h',
        issuer: 'example.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  // We are using promises in verifyRefreshToken but in verifyAccessToken we used it as a middleware
  //Both things are are valid the await will handle the promise and the next() will handle the middleware
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization'])
      return next(createError.Unauthorized('Invalid Credentials'));
    //spilt the token from the bearer token syntax
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, successPayload) => {
        //Error Handling
        if (err) {
          if (err.name === JWT.JsonWebTokenError) {
            //because we dont want to send the client err.message
            if (err) return next(createError.Unauthorized());
          } else {
            if (err) return next(createError.Unauthorized(err.message));
          }
          // We can shorten the above code like this
          // const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
          // return next(createError.Unauthorized(message))
        }
        req.payload = successPayload;
        // console.log(successPayload);
        //For authorization
        // if(successPayload.aud === "658919a52aacf69f0ff08a21") next(createError.Forbidden("You dont have access"))
        next();
      }
    );
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: '1y',
        issuer: 'example.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  // We are using promises in verifyRefreshToken but in verifyAccessToken we used it as a middleware
  //Both things are are valid the await will handle the promise and the next() will handle the middleware
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, successPayload) => {
          if (err) return reject(createError.Unauthorized());
          resolve(successPayload.aud);
        }
      );
    });
  },
};

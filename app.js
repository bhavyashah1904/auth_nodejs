const { application } = require('express');
const express = require('express');
const createError = require('http-errors');
require('dotenv').config();
const authRoute = require('./routes/authRoute.js');
const morgan = require('morgan');
require('./helpers/init_mongodb');
const { verifyAccessToken } = require('./helpers/jwt_helper');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.get('/', verifyAccessToken, async (req, res, next) => {
  res.send('Welcome to express!!');
});

app.use('/auth', authRoute);

//Error Handling for request to any other routes
//This error will be handled by the error handler
app.use(async (req, res, next) => {
  // const error = new Error('Not Found');
  // error.status(404);
  // next(error);
  //These three lnes can be replaced by the http-errors
  next(createError.NotFound('Route Not Found'));
});

//Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log('Server started');
});

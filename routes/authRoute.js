const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const User = require('../model/user.model');
const { authSchema } = require('../helpers/validationSchema')
const  {signAccessToken,
        signRefreshToken,
        verifyRefreshToken}  = require('../helpers/jwt_helper')

router.post('/register', async (req, res, next) => {
  try {
    // we want to avoid accessing the body directly and instead use the result of validation
    // const { email, password } = req.body;

    const validatedBody = await authSchema.validateAsync(req.body)
    if (!validatedBody.email || !validatedBody.password)
      throw createError.BadRequest('Please enter all fields');

    
    const userExist = await User.findOne({email : validatedBody.email});
    if (userExist)
      throw createError.Conflict(`User with ${validatedBody.email} already exists!`);

    const user = new User(validatedBody);

    //We are going to hash our passwords before we save them and we are going to that in next step
    //We are going to use mongoose middlewares(pre, post) to do the hashing 
    //The middlewares are fires whenever the user.save is caled
    //This is done in the user.model.js file
    const savedUser = await user.save();
    console.log(savedUser.id)
    //Generating Token
    const accessToken = await signAccessToken(savedUser.id)
    const refreshToken = await signRefreshToken(savedUser.id)
    res.send({accessToken, refreshToken});

  } catch (error) {
    //If there are validation errors we want to catch them here
    if(error.isJoi === true) error.status = 422;
    next(error);
  }
});
router.post('/login', async (req, res, next) => {
  try {
    const validatedBody = await authSchema.validateAsync(req.body)    
    if(!validatedBody.email || !validatedBody.password){
      throw createError.BadRequest("Please fill all the fields")
    }
    //Check if user exists
    //This will fetch the user and all its property form the database so we can compare it with the input
    const user = await User.findOne({email : validatedBody.email})
    if(!user){
      throw createError.NotFound("User does not exists")
    }

    //check if the password provided by the client matches with the password in the user variable
    //since user is defined inside the UserSchema it has access to the isValidPassword method
    const checkPassword = await user.isValidPassword(validatedBody.password)
    if(!checkPassword){
      throw createError.Unauthorized("Invalid Credentials")
    }

    //So now once the user is logged in we need to create a token and return the token to the client
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    res.send({accessToken, refreshToken})
  } catch (error) {
    if(error.isJoi === true) error.status = 422;
    next(error)
  }
});

router.post('/refresh-token', async (req, res, next) => {
  const { oldRefreshToken } = req.body;
  try{
   const userId = await verifyRefreshToken(oldRefreshToken)
   const newAccessToken = await signAccessToken(userId)
   const newRefreshToken = await signRefreshToken(userId)

   res.send({accessToken : newAccessToken, refreshToken : newRefreshToken})
  }catch(error){
    next(error)
  }
});
router.delete('/logout', (req, res, next) => {
  res.send('User Logged out');
});

module.exports = router;

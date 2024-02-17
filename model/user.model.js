const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//We want to fire a middleware whenever we save a document
//We cannot use arow functions here beacuse we want to use the this keyword
UserSchema.pre('save', async function (next) {
  try {
    //Create a salt and define number of round you want to go
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(this.password, salt);
    this.password = hashedPass;
    next();
  } catch (error) {
    next(error);
  }
});

//Check if the password provided by the user(the one in arguments) matche the password inside the user object
//(the one using this.password)

UserSchema.methods.isValidPassword = async function (password) {
  try {
    //this returns a boolean
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};
//Create our user here
const User = mongoose.model('user', UserSchema);
module.exports = User;

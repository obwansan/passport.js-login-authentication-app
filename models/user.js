var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

// This adds the methods on passportLocalMongoose to UserSchema
UserSchema.plugin(passportLocalMongoose);

// The User model is built from the UserSchema.
// This is ORM, i.e. the User model/object maps to the 'users' collection
// in the auth_demo_app database. So now methods on the User model/object 
// can be used to perfrom CRUD actions on the 'users' database.     
module.exports = mongoose.model("User", UserSchema);
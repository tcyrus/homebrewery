const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
	
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String},
	
	googleId:           String,
	googleAccessToken:  String,
	googleRefreshToken: String,
	
	brewsGoogle:       [String],			//GoogleIDs of the files stored on google drives
	brewsHomebrewery:  [String]				//IDs of the files stores on HomeBrewery 
	
}, { versionKey: false });

UserSchema.pre('save', function(next) {
	const user = this;
	if (!user.isModified('password')) return next();

	const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
	const hash = bcrypt.hashSync(account.password, salt);

	if(!hash) return next({ok : false, msg : 'err making password hash'});
	user.password = hash;
	return next();
});

UserSchema.methods.getGoogleBrews = function(){
	console.log("getting google brews");
	return this.brewsGoogle;
};

const User = mongoose.model('User', UserSchema);

module.exports = {
	schema : UserSchema,
	model  : User,
};
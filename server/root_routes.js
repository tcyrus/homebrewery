const router     = require('express').Router();
const {google}   = require('googleapis');

const HomebrewModel = require('./homebrew.model.js').model;


const oAuth2Client = new google.auth.OAuth2(
      '510891134909-4nbjhngrpgjub78088povp2fcddr04db.apps.googleusercontent.com', 'gxrKIfY9tGi6q8M_s-84hmRa', '/auth/google/redirect');
	
// Edit Page
app.get('/edit/:id', (req, res, next)=>{
	HomebrewModel.get({ editId: req.params.id })
		.then((brew)=>{
			req.brew = brew.sanatize();
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

module.exports = router;
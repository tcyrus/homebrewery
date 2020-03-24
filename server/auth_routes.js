const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
	res.render('login');
});

// auth logout
router.get('/logout', (req, res) => {
	// handle with passport
	res.send('logging out');
});

// auth with google - goes to google authentication popup
router.get('/google', passport.authenticate('google', {
	scope: ['profile', 'https://www.googleapis.com/auth/drive.file']
	//scope: ['profile']
}));

// callback route for google after the authentication popup
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
	console.log("redirecting");
	req.session.user = req.user;	//save user data to the session
	console.log("saved user to session");
	res.redirect(`/user/${req.user.username}`);
});



module.exports = router;

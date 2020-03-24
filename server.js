const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const app = express();
const authRoutes = require('./server/auth_routes');
const userRoutes = require('./server/profile_routes');
const passportSetup = require('./server/passport_setup');

const mongoose = require('mongoose');

const cookieSession = require('cookie-session');
const passport = require('passport');

app.use(express.static(`${__dirname}/build`));
app.use(require('body-parser').json({ limit: '25mb' }));
app.use(require('cookie-parser')());

// configure session cookies
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,    // 1 day
	keys: ['homebrewerycookiekey']	// Hide away
}));

// initialize passport
app.use(passport.initialize());

//app.use(passport.session());
//app.use(require('./server/forcessl.mw.js'));

// Load configuration values
const config = require('nconf')
	.argv()
	.env({ lowerCase: true })	// Load environment variables
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

// connect to mongodb
mongoose.connect(config.get('mongodb_uri') || config.get('mongolab_uri') || 'mongodb://localhost/naturalcrit');
mongoose.connection.once('open', ()=>{
	console.log('Connected to MongoDB');
});
mongoose.connection.on('error', ()=>{
	console.log('Error : Could not connect to a Mongo Database.');
	console.log('        If you are running locally, make sure mongodb.exe is running.');
	throw 'Can not connect to Mongo';
});

//Account Middleware
app.use((req, res, next)=>{
	if(req.cookies && req.cookies.nc_session){
		try {
			req.account = jwt.decode(req.cookies.nc_session, config.get('secret'));
		} catch (e){}
	}
	return next();
});


app.use(require('./server/homebrew.api.js'));
app.use(require('./server/admin.api.js'));


const HomebrewModel = require('./server/homebrew.model.js').model;
const UserModel     = require('./server/user_model.js').model;
const welcomeText   = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText = require('fs').readFileSync('./changelog.md', 'utf8');


//Source page
String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};
app.get('/source/:id', (req, res)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			const text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			return res.send(`<code><pre style="white-space: pre-wrap;">${text}</pre></code>`);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(404).send('Could not find Homebrew with that id');
		});
});

// set up routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);




//Share Page
app.get('/share/:id', (req, res, next)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			return brew.increaseView();
		})
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

//Print Page
app.get('/print/:id', (req, res, next)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});


//Render Page
const render = require('vitreum/steps/render');
const templateFn = require('./client/template.js');
app.use((req, res)=>{
	console.log("GBREWS SERVER");
	console.log(req.googleBrews);

	render('homebrew', templateFn, {
		version     : require('./package.json').version,
		url         : req.originalUrl,
		welcomeText : welcomeText,
		changelog   : changelogText,
		brew        : req.brew,
		brews       : req.brews,
		googleBrews : req.googleBrews,
		account     : req.account
	})
		.then((page)=>{
			return res.send(page);
		})
		.catch((err)=>{
			console.log(err);
			return res.sendStatus(500);
		});
});


const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);

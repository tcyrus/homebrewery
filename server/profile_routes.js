const router     = require('express').Router();
const {google}   = require('googleapis');

const HomebrewModel = require('./homebrew.model.js').model;


const oAuth2Client = new google.auth.OAuth2(
      '510891134909-4nbjhngrpgjub78088povp2fcddr04db.apps.googleusercontent.com', 'gxrKIfY9tGi6q8M_s-84hmRa', '/auth/google/redirect');
	
var fileMetadata = {
	'name': 'HOMEBREW TEST.txt'
};
	
var media = {
  mimeType: 'text/plain',
  body: 'The body of the file'
};


const authCheck = (req, res, next) => {
	if(!req.user){
		// if user is not logged in
		res.redirect('/auth/login');
	} else {
		// if logged in
		next();
	}
};

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

function createFile(auth) {
	const drive = google.drive({version: 'v3', auth});
	drive.files.create({
		resource: fileMetadata,
		media: media,
		fields: 'id'
	}).then(function (res) {
			console.log('FILE ID: ',res.data.id);
		}, function(err) {
			if (err) {
				console.error(err);
			}
	});
}

function readFileMetadata(auth, id) {
	const drive = google.drive({version: 'v3', auth});
	return new Promise((resolve, reject)=>{
		drive.files.get({
			fileId: id,
			fields: 'appProperties',
		})
		.then(function (res) {
				console.log('Gb FILE: ',res.data.appProperties.editId,' ',res.data.appProperties.title);
				console.log(res.data);
				resolve(res.data);
			}, function(err) {
				if (err) {
					console.error(err);
				}
				reject();
		});
	});
}

function readFile(auth) {
	const drive = google.drive({version: 'v3', auth});
	drive.files.get({
		fileId: '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-',
		alt: 'media',
	}).then(function (res) {
			console.log('CONTENTS: ',res.data);
		}, function(err) {
			if (err) {
				console.error(err);
			}
	});
}


function getGoogleBrews(auth, id) {
	console.log("GETTING THEM GOOGLE BREWSIES");
	var gBrewIds = id.brewsGoogle;
	var gBrewIds = ['15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-', '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-', '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-'];
	var googleBrews = [];
	
	return Promise.all(gBrewIds.map((gBrew)=>{
		return readFileMetadata(auth, gBrew)
				.then((metaData)=>{
					return {
						title:       metaData.appProperties.title,
						description: "A short description",
						authors:     ["me!"],
						updatedAt:   new Date(),
						shareId:     metaData.appProperties.shareId,
						editId:      metaData.appProperties.editId
					};
				});
	}));
}

router.get('/:username', authCheck, (req, res, next) => {
	const fullAccess = req.account && (req.account.username == req.params.username);
	
	// Find list of brews stored on Homebrewery
	HomebrewModel.getByUser(req.params.username, fullAccess)
		.then((brews)=>{
			req.brews = brews;
			return next();
		})
		.catch((err)=>{
			console.log(err);
		});
}, (req, res, next) => {
	oAuth2Client.setCredentials({
		access_token: req.user.googleAccessToken,
		refresh_token: req.user.googleRefreshToken
    });
	
		// Find list of brews stored on Google Drive
	getGoogleBrews(oAuth2Client, req.user)
		.then((googleBrews)=>{
			req.googleBrews = googleBrews;
			return next();
		})
		.catch((err)=>{
			console.log(err);
		});
});
	
/*		
	
	//async function someFunction() {
    //const myArray = [1, 2, 3];
    //const connection = mysql.createPool({ options });
    //let resolvedFinalArray = await Promise.all(myArray.map(async(value) => { // map instead of forEach
    //    const result = await asyncFunction(connection, value);
    //    finalValue.asyncFunctionValue = result.asyncFunctionValue;
    //    return finalValue; // important to return the value
    //}));
    //return functionThatUsesResolvedValues(resolvedFinalArray);
	
	req.googleBrews = resolvedGBrews;
	
	res.redirect(`/user/${req.user.username}`);
};*/
	
	/*gBrewIds.forEach((gBrew) => {
		
		var metaData = readFileMetadata(oAuth2Client, gBrew);
		console.log("METADATA for ",gBrew);
		console.log(res.data);
		googleBrews.push({
			title:       metaData.appProperties.title,
			description: "A short description",
			authors:     ["me!"],
			updatedAt:   new Date(),
			shareId:     metaData.appProperties.shareId
		});
	});
	
	Promise.all(promises).then
	
	console.log("1");
	readFileMetadata(oAuth2Client, '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-');
	console.log("2");
	readFileMetadata(oAuth2Client, '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-');
	console.log("3");
	readFileMetadata(oAuth2Client, '15T5wNrS9Zb6m91e4f6mW-ngMrSYJTNr-');
	
	req.googleBrews = googleBrews;
	
	console.log("GOT THEM GOOGLE BREWSIES");
	console.log(req.googleBrews);
	
	
	//send('you are logged in, this is your profile - ' + req.user.username);*/


module.exports = router;
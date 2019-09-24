const express = require('express');
const { check, validationResult} = require('express-validator');
const basicAuth = require('express-basic-auth');
const crypto = require('crypto');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const storageController = require('./storageController');

const app = express();

app.use(express.static('public'));

// This is how we parse the form input.
app.use(express.json());

// This is how we parse incoming webhooks from Twilio.
app.use(express.urlencoded({ extended: false }));

// This ensures that we always redirect to https.
// See: https://stackoverflow.com/a/49176816/
app.enable('trust proxy');
app.use( function(request, response, next) {
  if (request.secure) {
    next();
  }
  else {
    response.redirect('https://' + request.headers.host + request.url);
  }
});

// Serve the homepage/landing page.
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Serve the admin page.
app.get('/admin', (request, response) => {
  response.sendFile(__dirname + '/views/admin.html');
})

// Serve the curated page.
app.get('/curated', (request, response) => {
  response.sendFile(__dirname + '/views/curated.html');
})

// Fetch the list of questions — authenticated using the express-basic-auth module.
// See: https://github.com/LionC/express-basic-auth
app.get('/questions', basicAuth({
  authorizer: simpleAdminAuthorizer,  // This is how we authorize the user
  challenge: true                     // This pops up a form to get the login credentials
}), (request, response) => {
  storageController.getQuestionList().then(
    (data) => {
      response.send(data)
    }
  )
});

// The twilio.webhook() middleware validates the incoming request as
// coming from Twilio. This matches your Twilio auth token against
// process.env.TWILIO_AUTH_TOKEN.
app.post('/sms', [
  check('Body').trim().escape()
], twilio.webhook(), (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    return response.sendStatus(422);
  }
  // If the request body has a Body property, we continue:
  if (request.body.Body) {
    // Create a MessagingResponse object to return as a response.
    const twiml = new MessagingResponse();
    // Call the storageController's addQuestion method...
    storageController.addQuestion(request.body.Body).then(
      (success) => {
        // ...set the response text appropriately per the returned value...
        if (success) {
          twiml.message('We\'ve received your question. Thanks!');
        }
        else {
          twiml.message('Oops, something went wrong. Try again?');
        }
        /// ...and send the response back.
        response.writeHead(200, { 'Content-Type': 'text/xml' });
        response.end(twiml.toString());
      }
    )
  }
  // If there's no Body property, send back a 400 (bad request) status.
  else {
    response.sendStatus(400);
  }
});

// For questions submitted via the form on the landing page.
app.post('/form', [
  check('Body').trim().escape()
], (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    return response.sendStatus(422);
  }
  // If the request body has a Body property, we continue:
  if (request.body.Body) {
    // Create a MessagingResponse object to return as a response.
    const twiml = new MessagingResponse();
    // Call the storageController's addQuestion method...
    storageController.addQuestion(request.body.Body).then(
      (success) => {
        // ...set the response text appropriately per the returned value...
        if (success) {
          twiml.message('We\'ve received your question. Thanks!');
        }
        else {
          twiml.message('Oops, something went wrong. Try again?');
        }
        /// ...and send the response back.
        response.writeHead(200, { 'Content-Type': 'text/xml' });
        response.end(twiml.toString());
      }
    )
  }
  // If there's no Body property, send back a 400 (bad request) status.
  else {
    response.sendStatus(400);
  }
});

// This endpoint toggles whether a given question is selected or not.
app.post('/toggleSelection', [
  // Make sure to trim whitespace and escape any HTML entities.
  check('question').trim().escape()
], (request, response) => {
  storageController.toggleSelection(request.body);
  response.sendStatus(200);
})

// Start our server!
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// This is the authorizer on the /questions route. When the user submits their username
// and password, we...
function simpleAdminAuthorizer(username, password) {
  // ...hash the password and get back the hex value...
  const hashedPassword = crypto.createHash('sha256').update(password, 'binary').digest('hex');
  // ...compare the username and the hashed password against what's in the .env file (safeCompare returns true or false)...
  const usernameMatches = basicAuth.safeCompare(username, process.env.ADMIN_USERNAME);
  const passwordMatches = basicAuth.safeCompare(hashedPassword, process.env.ADMIN_PASSWORD);
  
  // ...and return the bitwise AND of the username and password comparisons above.
  return usernameMatches & passwordMatches;
}
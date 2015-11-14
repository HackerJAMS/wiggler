//hash a cleartext pwd in node



// Use this object to store users and their passwords.
// Feel free to change the way passwords are stored,
// but make sure that the object's keys remain usernames.
var users = module.exports.users = {};


// Sign up a new user
var signup = module.exports.signup = function (user, password, next) {
  // Store the password with the user to check it on later logins
  users[user] = password;
  next();
};

// Log in an existing user
var login = module.exports.login = function (user, password, res, next) {
  // Make sure that the password matches the one already in the database
  if (users[user] === password) {
    next();
  } else {
    res.status(401); // Unauthorized
    res.end('Incorrect password for user ' + user);
  }
};

// Do not worry about the internals of this function
var hasher = module.exports.hasher = function (string) {
  var hash = '';

  // For the sake of this assessment, assume that this hashes correctly
  for (var i = 0; i < string.length; i++) {
    hash += ((string.charCodeAt(i) >> 1 ) + 5) % 45;
  }

  return hash;
};

// This middleware passes control to login or signup,
// depending on whether a user is already a key in the users object
var auth = module.exports.auth = function (req, res, next) {
  var user = req.body.user;
  var pass = req.body.pass;

  if (!user || !pass) {
    res.status(401); // Unauthorized
    res.end('User and password must be supplied');
    return;
  }

  if (users[user] !== undefined) {
    login(user, pass, res, next);
  } else {
    signup(user, pass, next);
  }
};

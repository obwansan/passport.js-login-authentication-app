// The express module returns a function.
var express               = require("express"), 
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),               
    LocalStrategy         = require("passport-local"),
    expressSession        = require("express-session"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user");

// Creates new auth_demo_app database and connects to it.
mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true });

// The express function returns an object which can be used to configure an express application.
var app = express();
// This registers a template engine for the app.
app.set('view engine', 'ejs'); 

// Run express-session with supplied parameters
app.use(expressSession({
  secret: "Wouldn't you like to be a pepper too?",
  resave: false,
  saveUninitialized: false
}));
// Set up passport.js in our app
app.use(passport.initialize());
app.use(passport.session());
// Always needed when posting forms. So you can access properties on the req.body object
app.use(bodyParser.urlencoded({extended: true}));

/** 
 * deserializeUser() and serializeUser() are available on the User object because 
 * they were added to UserSchema from passportLocalMongoose in user.js. 
 * So both the passport-local-mongoose and passport packages must have their own
 * deserializeUser() and serializeUser() methods.
 */

 // Sets up passport to accept username and password for user authentication.
passport.use(new LocalStrategy(User.authenticate()));
// Takes the encoded data from the session, deserializes and and decodes it.
passport.deserializeUser(User.deserializeUser());
// Serializes and encodes the data, and puts it back in the session.
passport.serializeUser(User.serializeUser());

// ===============
// ROUTES
// ===============

app.get("/", function(req, res) {
  res.render("home");
});

// When a a get request is sent to the "/secret" route, the isLoggedIn function is called before anything else happens 
// (it's middleware). If the user's credentials are authenticated, the 'next' callback function is called, that renders 
// the /secret page. If not, you're redirected back to the log in page and the 'next' function isn't called.
app.get("/secret", isLoggedIn, function(req, res) {
  res.render("secret");
});

/*** AUTH ROUTES ***/

// sign-up form
app.get("/register", function(req, res) {
  res.render("register");
});

// handle user sign-up
app.post("/register", function(req, res) {
  // Creates a new user in the database with the username and password.
  // The register method hashes the password (why it's not set as a property on the object passed to register() ) 
  // so the actual password isn't stored in the database.
  // register() returns either an error object or user object to the callback.
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.render('register');
    }
    // Logs the user in, puts info in the session, runs passport.serializeUser etc
    // The 'local' passport authentication means just password and username (see passport docs).
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secret");
    });
  });
});

/*** LOGIN ROUTES ***/

// render the login form
app.get("/login", function(req, res) {
  res.render("login");
})

// login logic
// Submitting the form generates a post request to this app.post("/login") route. 
// The form data (i.e. username and password) are available as properties on the 
// request object passed to the route callback (e.g. req.body.username). 
// passport.authenticate() is middleware (i.e. code that runs between the request 
// and response, or between the beginning and end of the route).
// passport.authenticate() tries to log the user in. It gets the username and password 
// off request.body and authenticates them.
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res) {
});

app.get("/logout", function(req, res) {
  // passport.js destroys all user data stored in the session (stored from http request to request)
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// The app.listen() function creates the Node.js web server at the specified host and port (in this case localhost:3000). 
// It is identical to Node's http.Server.listen() method (when you run the command 'node app.js' this listens on port 3000 
// so the 'base' for all routes is localhost:3000)
app.listen(3000, function() {
  console.log("server started.....");
});

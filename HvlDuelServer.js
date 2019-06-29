var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var jwt       = require('jsonwebtoken');
var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var secretKey = "Secret-to-parse-jwt-token-hvlduel";
mongoose.connect('mongodb://localhost:27017/HvlDuel', {useNewUrlParser: true});

// Models
var User          = require('./models/User');
var Activity      = require('./models/Activity');
var Duel          = require('./models/Duel');
var PersHistory   = require('./models/Pershistory');
var PublicHistory = require('./models/Publichistory');
var UserActivity  = require('./models/UserActivity');

// Test api - welcome
app.get( '/api/welcome', function(req, res) {
    // adding test activity
    console.log('Welcome to Havelsan Challenge App');
    var act1 = new Activity({
        actname : "Geometry"
    });

    act1.save(function (err, activity) {
        return res.json({status : true});
    });

})

app.post('/api/register', function (req, res) {
    if (!req.body)
        return res.sendStatus(422);

    console.log('Requested user body : ' + JSON.stringify(req.body));  
    
    User.find({mail : req.body.mail}, function (err, userValidate) {
        if (userValidate.length){
            console.log(req.body.mail + " already registered!");
            return res.status(401).json({ status: false, message:  req.body.mail +' already registered!' });
        }else{
            let accessToken = jwt.sign(
                          {mail: req.body.mail},
                          secretKey,    
                          { 
                              expiresIn: '12h' // expires in 7 days
                          }
            );
            var newUser = new User({ 
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        password: req.body.password,
                        mail : req.body.mail,
                        token : accessToken
                      });

            console.log('New user body : ' + JSON.stringify(newUser));  
            newUser.save(function (err, user) {
                if (err){
                    return res.status(402).json({
                                        status  : false,
                                        message : 'The user could not saved!' 
                                      });
                }
                console.log(user.mail + " saved to Havelsan Challenge App Storage.");
                return res.json({status : true, mail : user.mail, token : user.token});
            });
        }
    });
})


app.post('/api/checkToken', function(req, res) {

  if (Object.keys(req.headers).indexOf('authorization') == -1)
    return res.sendStatus(401);

  var token = req.headers.authorization;
  if (token.indexOf('Bearer') != 0)
    return res.sendStatus(401);

  token = token.substring(7);

  User.findOne({mail : req.body.mail}, function (err, user) {
      if( err )
        return res.status(401).json({ status: false, message: 'User could not be found!' });
      else {
        console.log('Current user mail : ' + user.mail );
          // verifies secret and checks whether the token is expired or not
          return jwt.verify(user.token , secretKey, function(err, decoded) {
              if (err) {
                  console.log('Token has Expired!');
                  return res.status(401).json({ status : false, message : 'Token has EXPIRED!' });
              } else {
                  console.log('Authentication was verified succesfully.');
                  // if everything is good, save to request for use in other routes
                  return res.status(200).json({ status : true, message : 'Authentication was verified succesfully.' });
              }
          });
      }
  })
})


app.post('/api/login', function (req, res) {

  setTimeout(function() {

    if (!req.body)
      return res.sendStatus(422);

    if (!req.body.mail )
      return res.sendStatus(422);

    var username = req.body.u;

    if (!req.body.password )
      return res.sendStatus(422);

    var password = req.body.p;

    User.findOne({mail : req.body.mail, password : req.body.password }, function (err, userValidate) {
        if( err ){
            return res.status(404).json({
                status: false,
                message: 'There is no such user : ' + req.body.mail 
            });
        } else {
            console.log('user name : ' + userValidate.firstname);
            return jwt.verify(userValidate.token , secretKey, function(err, decoded) {
                if (err) {
                    var newAccessToken = jwt.sign(
                                      {firstname: userValidate.firstname},
                                      secretKey,
                                      {expiresIn: '12h'}
                                    );
                      userValidate.token = newAccessToken;

                      userValidate.save(function (err, user) {
                          if (err){
                              return res.status(402).json({
                                              status  : false,
                                              message : 'The user could not saved!' 
                                            });
                      }

                      console.log('New token generated for ' + userValidate.mail);
                      return res.status(200).json({status : true});
                  });

                } else {
                    // if everything is good, save to request for use in other routes
                    console.log('JWT has not expired yet!');
                    return res.status(200).json({   status : true });
                }
            });
        }
    })
  }, 200);

    // return warning message when timeout while logging in
    
})

app.post('/api/addActivities', function (req, res) {
    User.findOne({mail : req.body.mail }, function (err, userValidate) {
        if(err){
          return res.status(404).json({
                status: false,
                message: 'There is no such user : ' + req.body.mail 
            });
        } else {
            for (var i = 0; i < req.body.activities.length; ++i) {
                Activity.findOne({ actname: req.body.activities[i] }, function (err, validActivity) {

                    if (err){
                        return res.status(404).json({
                                            status  : false,
                                            message : 'The activity could not saved!' 
                                          });
                    } else {
                        console.log('Activity name : ' + validActivity.actname );
                        var newActivity = new UserActivity({ 
                            userId : userValidate._id,
                            actId  : validActivity._id
                        });

                        newActivity.save();  
                    }
                });
            }
        }
        return res.status(200).json({
                                      status  : true,
                                      message : 'All activities added to the user :' + userValidate.mail 
                                    });
    })
})

app.post('/api/getRelatedUsers', function (req, res) {

    var userList = [];
    Activity.findOne({actname : req.body.actname }, function (err, validActivity) {
        if(err){
          return res.status(404).json({
                status: false,
                message: 'There is no such category : ' + req.body.actname 
            });
        } else {
            console.log('Here');
            UserActivity.find({ actId: validActivity._id }, function (err, validUserActivity) {
                for (var i = 0; i < validUserActivity.length ; ++i) {
                    console.log(validUserActivity.actId);
                    User.findOne({ _id  : validUserActivity.userId }, function(err, validUser){
                        userList.push(validUser);
                    })  
                }
            })
        }
    })
    setTimeout(function() {
                  return res.status(200).json({status  : true, list : userList });
                }, 3000);
})


app.listen(3035, function () {
  console.log('Server s listening on port 3035!')
})


// const express = require('express')
// const app = express()
// const cors = require('cors')
// app.use(cors())
// const server = require('http').Server(app)
// const io = require('socket.io')(server)
// const { ExpressPeerServer } = require('peer');
// const peerServer = ExpressPeerServer(server, {
//   debug: true
// });


// app.use('/peerjs', peerServer);
// const { v4: uuidV4 } = require('uuid')
// app.set('view engine', 'ejs')
// app.use(express.static('public'))



const express = require("express");
const app = express();
// const { v4: uuidv4 } = require('uuid');
const server = require("http").Server(app);
const io = require("socket.io")(server);
var cors = require('cors');
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use("/peerjs", peerServer);
const { v4: uuidV4 } = require('uuid')
require('dotenv').config()
const cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'bla bla bla' 
  }));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const nodemailer = require("nodemailer");
const keys = require('./config/keys')

const passportSetup = require('./config/passport-setup')
const router = require("express").Router();
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


var username = "initialUsername";


const authCheck = (req, res, next) => {
    // console.log(username);
    if(username === "initialUsername"){
        res.render('404');
    } else {
        next();
    }
    // next();
};

app.get('/home', authCheck, (req,res)=>{
    res.render('home', {user: username});
})

app.get("/room", authCheck, function(req, res){
    res.redirect(`/${uuidV4()}`);
    // res.redirect("/uuidV4()");
});

var email;
var url = require('url');

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}

var link;
app.get('/', (req,res)=>{
    link = fullUrl(req);
    console.log(link);
    res.render('login');
})

app.get('/auth/login', (req,res)=>{
    res.render('login');
})

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile'],
    // prompt: 'select_account'
}));


app.get('/auth/logout', (req,res,next)=>{
    // req.session.destroy();
    console.log("hue");
    req.logout(function(err) {
        
        if (err) { return next(err); }
        res.redirect('/');
    });
    
})
app.get('/auth/logout', (req,res,next)=>{
    // req.session.destroy();
    console.log("hue");
    req.logout(function(err) {
        
        if (err) { return next(err); }
        res.redirect('/');
    });
    console.log(username);
})

app.get('/auth/google/redirect', passport.authenticate('google'), (req,res)=>{
    username = req.user.username;
    res.redirect('/home');
})


var ROOM_ID;
app.get("/:room", authCheck,  function(req, res){
    var temp =  req.params.room;
    if(temp.length > 12) ROOM_ID = req.params.room;
    // console.log(ROOM_ID);
    res.render("room", {roomId: req.params.room, user: username});
});



app.post('/room', (req, res) => {
    console.log("hue");
    console.log(req.body);
    email = req.body.email;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: keys.credentials.email,
            pass: keys.credentials.password
        }
    })

    const mailOptions = {
        from: 'dezylsolanki3@gmail.com',
        to: email,
        subject: 'Meet reminder!',
        text: `Your meet with ${username} is about to start. The Room ID is ${link}${ROOM_ID}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log(email);
            console.log(error);
        }
        else{
            console.log('success');
            alert('Email sent!');
        }
    })
})
// app.post('/room', (req, res) => {
//     console.log("hue");
//     console.log(req.body);
// })


io.sockets.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => { //roomId, userId
        socket.join(roomId);
        // socket.to(roomId).broadcast.emit("user-connected");
        socket.broadcast.to(roomId).emit("user-connected", userId);
        // console.log("room joined");
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        }); 
    });
});


app.use(express.json());

// app.post('/' + ROOM_ID, (req, res) => {
//     console.log("hue");
//     console.log(req.body);
// })
// app.post('/room', (req, res) => {
//     console.log("hue");
//     console.log(req.body);
// })

const mongoose = require('mongoose');

// const cookieSession = require('cookie-session');


// app.use(cookieSession({
//     maxAge: 24*60*60*1000,
//     // name: 'google-auth-session',
//     keys: [keys.session.cookieKey]
// }));


// mongoose.connect(keys.mongodb.dbURL, () =>{
//     console.log("hue");
// })
const MONGO_PROD_URI = keys.mongodb.dbURL;
mongoose 
 .connect(MONGO_PROD_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
           })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));
// mongoose.connect(
//     STRING_URL (keys.mongodb.dbURL),
//      { 
//       useNewUrlParser: true, 
//       useUnifiedTopology: true 
//     }
//   );

// app.use('/auth', authRoutes.router);

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log("server started!");
});











// import { verify } from './google.js';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// import logger from 'morgan';
// import indexRouter from './routes/index.js';
// import apiRouter from './routes/api.js';



// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// const baseDir = dirname(fileURLToPath(import.meta.url));

// app.use(express.static(join(baseDir, 'public')));
// app.set('views', join(baseDir, 'views'));
// app.engine('.html', ejs.__express);
// app.set('view engine', 'html');


// app.post('/login', async (req, res) => {
//   const user = await verify(req.body.credential);
//   req.session.regenerate(() => {
//     req.session.user = user;
//     res.redirect('/');
//   });
// })

// app.use("/api", apiRouter);
// app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));
// app.use("/", indexRouter);

// app.use(logger(':method :url'))



// require('./auth');

// const passport = require('passport');

// function isLoggedIn(req, res, next) {
//   req.user ? next() : res.sendStatus(401);
// }


// app.use(passport.initialize());
// app.use(passport.session());

// // app.get('/', (req, res) => {
// //   res.send('<a href="/auth/google">Authenticate with Google</a>');
// // });

// app.get('/auth/google',
//   passport.authenticate('google', { scope: [ 'email', 'profile' ] }
// ));

// app.get( '/auth/google/callback',
//   passport.authenticate( 'google', {
//     successRedirect: '/protected',
//     failureRedirect: '/auth/google/failure'
//   })
// );

// app.get('/protected', isLoggedIn, (req, res) => {
//   res.send(`Hello ${req.user.displayName}`);
// });

// // app.get('/logout', (req, res) => {
// //   req.logout();
// //   req.session.destroy();
// //   res.send('Goodbye!');
// // });

// app.get('/auth/google/failure', (req, res) => {
//   res.send('Failed to authenticate..');
// });

//------------------------------------------------------------------------------

// const passport = require('passport');
// var userProfile;

// app.use(passport.initialize());
// app.use(passport.session());

// app.set('view engine', 'ejs');

// app.get('/room', (req, res) => res.send(userProfile));
// app.get('/error', (req, res) => res.send("error logging in"));



// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const GOOGLE_CLIENT_ID = '697265471528-5kgc28db7f3cukjcg2rqbh44sduutiqg.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = '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';
// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//       userProfile=profile;
//       return done(null, userProfile);
//   }
// ));

// passport.serializeUser(function(user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function(obj, cb) {
//   cb(null, obj);
// });
 
// app.get('/auth/google', 
//   passport.authenticate('google', { scope : ['profile', 'email'] }));
 
// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/error' }),
//   function(req, res) {
//     // Successful authentication, redirect success.
//     res.redirect('/room');
//   });

//-------------------------------------------------------------------------------------



// const express = require('express');
// const app = express();
  
// const session = require('express-session')

// app.use(session({
//    secret: 'somethingsecretgoeshere',
//    resave: false,
//    saveUninitialized: true,
//    cookie: { secure: true }
// }));
  
// app.listen(3000 , () => {
//     console.log("Server running on port 4000");
// });

// const passport = require('passport');
// const cookieSession = require('cookie-session');
// require('./auth');
  
// app.use(cookieSession({
//     name: 'google-auth-session',
//     keys: ['key1', 'key2']
// }));
// app.use(passport.initialize());
// app.use(passport.session());
    
  
// app.get('/', (req, res) => {
//     res.send("<button><a href='/auth'>Login With Google</a></button>")
// });
  
// // Auth 
// app.get('/auth' , passport.authenticate('google', { scope:
//     [ 'email', 'profile' ]
// }));
  
// // Auth Callback
// app.get( '/auth/callback',
//     passport.authenticate( 'google', {
//         successRedirect: '/auth/callback/success',
//         failureRedirect: '/auth/callback/failure'
// }));
  
// // Success 
// app.get('/auth/callback/success' , (req , res) => {
//     if(!req.user)
//         res.redirect('/auth/callback/failure');
//     res.send("Welcome " + req.user.email);
// });
  
// // failure
// app.get('/auth/callback/failure' , (req , res) => {
//     res.send("Error");
// })
  
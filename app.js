//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- create an express application --- 
const express = require("express");
const app = express();

// *** --- support HTTP version of app  ---
const http = require("http");

// *** --- support mongoose for database connect ---
const mongoose = require("mongoose");

// *** --- error handling for development only mode ---
const errorhandler = require("errorhandler");

// *** --- enable CORS for user request ---
const cors = require("cors");

// *** --- implement middleware ---
const bodyParser = require("body-parser");
const session = require("express-session");

// *** --- implement cors ---
app.use(cors());

// *** --- express configuration ---
app.use(require("morgan")("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());
app.use(require("method-override")());
app.use(
    // set session for API request
    session({
        secret: "cayc_unrealkingdom",
        cookie: {
            maxAge: 60000,
        },
        resave: false,
        saveUninitialized: false,
    })
);

// *** --- include database models ---
require("dotenv/config");
require("./models/UserSchema");
require("./models/UserInfoSchema");

// *** --- import API routes ---
app.use(require("./routes"));

// *** --- catch 404 and forward to the errorhandler ---
app.use(function (req, res, next) {
    const err = new Error("Not Found 404");
    err.status = 404;
    next(err);
});

// *** --- connect to the database and track errors if in dev mode ---
mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    },
    () => console.log("connected to the databse!")
);

if (process.env.DB_CONNECTION === "dev") {
    // add debug tracking for dev environment
    mongoose.set("debug", true);
    mongoose.set("setCreateIndex", true);

    // development error handler
    app.use(errorhandler());
}

// *** --- retrieve error message ---
app.use(function (err, req, res) {
    console.log(err.status);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: err,
        },
    });
});

//*** --- binds and listens for connections on the specific host and port ---
http.createServer(app).listen(process.env.PORT);

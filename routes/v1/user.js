//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- import router and database models
const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const UserSchema = mongoose.model("UserSchema");
const CharacterSchema = mongoose.model("CharacterSchema");
const ObjectID = require('mongodb').ObjectId;

require("dotenv/config");

// *** --- add new character request ---
router.post("/addCharacter", async function (req, res, next) {
    const { userid, race, classe, gender } = req.body;

    // check if request body is empty or validated
    if (!userid || !race || !classe || !gender || !ObjectID.isValid(userid)) {
        return res.status(400).json({
            msg: "validation error",
        });
    }

    // retrieve user information by id
    const user = await UserSchema.findById(userid);

    // add new character if user is exisiting
    if (user) {
        const character = new CharacterSchema({ userid: userid, race: race, classe: classe, gender: gender });
        await character.save();

        return res.status(200).json({
            msg: "new character added",
        })
    } else {
        return res.status(403).json({
            msg: "user is not exisiting",
        });
    }
})

// *** --- delete existing character request ---
router.post("/deleteCharacter", async function (req, res, next) {
    const { characterid } = req.body;

    // check if request body is empty or validated
    if (!characterid || !ObjectID.isValid(characterid)) {
        return res.status(400).json({
            msg: "wrong character id",
        });
    }

    // retrieve character information by id
    const character = await CharacterSchema.findById(characterid);

    // delete character if it is existing
    if (character) {
        // find character by character id and remove from database
        await CharacterSchema.findByIdAndDelete(characterid);
        return res.status(200).json({
            msg: "character successfully removed",
        })
    } else {
        return res.status(403).json({
            msg: "character is not exisiting",
        });
    }
})


// *** --- signup request ---
router.post("/signup", async function (req, res, next) {
    const { name, email, password } = req.body;

    // check request fields
    if (!name || !email || !password) {
        return res.status(400).json({
            msg: "can't be blank",
        });
    }

    // retrieve user information by user email
    const user = await UserSchema.findOne({
        email: email,
    });

    // register new user if user is not existing
    if (user) {
        return res.status(403).json({
            msg: "user is already exisiting",
        });
    } else {
        let newbie = new UserSchema({ name: name, email: email });
        newbie.setPassword(password);
        await newbie.save().then(function () {
            return res.status(200).json({
                msg: "new user added",
            })
        }).catch(function (err) {
            return res.status(400).json({
                msg: 'validation error - try another information',
            });
        });
    }
});

// *** --- login request ---
router.post('/login', async function (req, res, next) {
    const { email, password } = req.body;

    // check request fields
    if (!email || !password) {
        return res.status(400).json({
            msg: "can't be blank",
        });
    }

    // retrieve user information by user email
    const user = await UserSchema.findOne({
        email: email,
    });

    // try login request
    if (!user) {
        return res.status(404).json({
            msg: 'user is not registered',
        });
    } else {
        passport.authenticate(
            'local',
            {
                session: false,
            },
            function (err, user) {
                if (err) {
                    return next(err);
                }
                if (user) {
                    user.token = user.generateJWT();

                    return res.json({
                        user: user.toAuthJSON(),
                    });
                } else {
                    return res.status(401).json({
                        msg: 'invalid credential',
                    });
                }
            }
        )(req, res, next);
    }
});

// *** --- forget password request ---
router.post('/forgetpassword', async function (req, res, next) {
    // check if user is existing
    const user = await UserSchema.findOne({
        email: req.body.email,
    }).catch(next);
    if (user) {
        // set token expire
        const today = new Date();
        const exp = new Date(today);
        exp.setMinutes(today.getMinutes() + 300);

        //generate 4 digits and sign jwt
        const randomMsg = Math.floor(1000 + Math.random() * 9000);
        const token = jwt.sign(
            {
                msg: randomMsg,
                email: user.email,
                exp: parseInt(exp.getTime() / 1000),
            },
            process.env.SECRET
        );
        return res.status(200).json({
            token,
            msg: 'verification email sent',
        });
    } else {
        return res.status(404).json({
            msg: 'user is not registered',
        });
    }
});

// *** --- verify forget password request ---
router.post('/verifyforget', async function (req, res) {
    const { token, digits, newPassword } = req.body;
    if (!token || !digits || !newPassword) {
        const { msg, email } = jwt.verify(token, process.env.SECRET);

        // if decoded 4-digits are same from backend request
        if (digits === msg) {
            const user = await UserSchema.findOne({
                email: email,
            });

            // find if user is available in the database
            if (user) {
                user.setPassword(newPassword);
                user.save()
                    .then(function () {
                        return res.status(200).json({
                            msg: 'successfully reset password',
                        });
                    })
                    .catch(function (err) {
                        return res.status(400).json({
                            msg: 'validation error - try another information',
                        });
                    });
            } else {
                return res.status(404).json({
                    msg: 'user is not registered',
                });
            }
        } else {
            // when 4-digits are wrong
            return res.status(401).json({
                msg: 'wrong digits code',
            });
        }
    } else {
        return res.status(400).json({
            msg: "can't be blank",
        });
    }

});

// *** --- export user router ---
module.exports = router;

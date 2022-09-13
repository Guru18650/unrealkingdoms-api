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
const UserInfoSchema = mongoose.model("UserInfoSchema");
require("dotenv/config");

// *** --- !!! important !!! : these endpoints are added for testing purpose (admin privilege and authenticate required so do not use for production) ---

// *** --- add new user request ---
router.post("/addUser", async function (req, res, next) {
    const { userid, name, email, password, createdate, lastlogindate, lastloginip } = req.body;

    // retrieve user information by user name
    const user = await UserSchema.findOne({
        name: name,
    });

    // add new user if user is not available
    if (user) {
        return res.status(402).json({
            msg: "user is already available",
        });
    } else {
        const newUser = new UserSchema({ userid: userid, name: name, email: email, password: password, createdate: createdate, lastlogindate: lastlogindate, lastloginip: lastloginip });
        await newUser.save();

        return res.status(200).json({
            msg: "new user added",
        })
    }
})

// *** --- delete user request ---
router.post("/deleteUser", async function (req, res, next) {
    const { name } = req.body;

    // retrieve user information by user name
    const user = await UserSchema.findOne({
        name: name,
    });

    // delete user if user is available
    if (user) {
        UserSchema.deleteOne({ name: name }, (error, data) => {
            if (error) {
                console.log("error in delete");
                throw error;
            } else {
                console.log("user deleted", data);
                res.status(200).json({
                    msg: "user deleted",
                })
            }
        })

    } else {
        return res.status(402).json({
            msg: "user is not existing",
        });
    }
})

// *** --- add new user info request ---
router.post("/addUserInfo", async function (req, res, next) {
    const { userid, race, classe, gender } = req.body;

    // retrieve user information by user id
    const user = await UserSchema.findOne({
        userid: userid,
    });
    // add new user info if user id is exisiting
    if (user) {
        console.log(user.name);

        const newUserInfo = new UserInfoSchema({ userid: userid, race: race, classe: classe, gender: gender });
        await newUserInfo.save();

        return res.status(200).json({
            msg: "new user info added",
        })

    } else {
        return res.status(403).json({
            msg: "user id is not exisiting",
        });
    }
})

// *** --- delete user request ---
router.post("/deleteUserInfo", async function (req, res, next) {
    const { userid } = req.body;

    // retrieve user information by user name
    const user = await UserInfoSchema.findOne({
        userid: userid,
    });

    // delete user if user is available
    if (user) {
        UserInfoSchema.deleteOne({ userid: userid }, (error, data) => {
            if (error) {
                console.log("error in delete - user info");
                throw error;
            } else {
                console.log("user info deleted", data);
                res.status(200).json({
                    msg: "user info deleted",
                })
            }
        })

    } else {
        return res.status(402).json({
            msg: "user info is not existing",
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

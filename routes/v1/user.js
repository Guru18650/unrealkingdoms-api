//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- import router and database models
const mongoose = require("mongoose");
const router = require("express").Router();
const UserSchema = mongoose.model("UserSchema");
const UserInfoSchema = mongoose.model("UserInfoSchema");

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

module.exports = router;

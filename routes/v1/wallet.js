//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- import router and database models
const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require('../middleware/auth');
const UserSchema = mongoose.model("UserSchema");
const WalletSchema = mongoose.model("WalletSchema");
const ObjectID = require('mongodb').ObjectId;
const WAValidator = require('wallet-address-validator');

require("dotenv/config");

// *** --- update user wallet ---
router.post("/updateuserwallet", async function (req, res, next) {
    const { userid, wallet } = req.body;

    // check if request body is empty or validated
    if (!userid || !ObjectID.isValid(userid) || !wallet) {
        return res.status(400).json({
            msg: "validation error - try another information",
        });
    }

    // retrieve user information by id
    const user = await UserSchema.findById(userid);

    // update user wallet information if user is existing
    if (user) {
        // check if wallet address is valid and not existing in db
        const valid = WAValidator.validate(wallet, "ethereum");
        const item = await WalletSchema.findOne({ wallet: wallet });

        // update wallet information if user and wallet are valid
        if (valid && item == null) {
            // update database by new wallet and userid
            const newWallet = new WalletSchema({ userid: userid, wallet: wallet });
            await newWallet.save();

            return res.status(200).json({
                msg: "wallet successfully updated",
            })
        } else {
            // when request informations are incorrect
            return res.status(400).json({
                msg: "validation error - wallet address is not valid",
            });
        }
    }
    else {
        // retrieve message when user is not existing
        return res.status(403).json({
            msg: "user is not exisiting",
        });
    }
})

// *** --- export wallet router ---
module.exports = router;
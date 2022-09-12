//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- initialize variables --- 
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
require("dotenv/config");

// *** --- define user schema  --- 
const UserSchema = new mongoose.Schema(
    {
        userid: { type: Number, min: 0, max: 9999 },
        name: { type: String },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/\S+@\S+\.\S+/, "is invalid"],
            index: true,
        },
        password: { type: String, required: true },
        salt: { type: String },
        hash: { type: String },
        createdate: {
            type: Date, default: Date.now
        },
        lastlogindate: {
            type: Date, default: Date.now
        },
        lastloginip: { type: String }
    },
    {
        timestamps: true,
    }
);

// *** --- setup user model validator  ---
UserSchema.plugin(uniqueValidator, { message: "is already taken" });

// *** --- authenticate related functions  ---
// *** --- generate json web tokens for auth control ---
UserSchema.methods.generateJWT = function () {
    const today = new Date();
    const exp = new Date(today);

    // set expire date as 1 day for now (placeholder)
    exp.setDate(today.getDate() + 1);
    return jwt.sign(
        {
            id: this._id,
            name: this.name,
            expt: parseInt(exp.getTime() / 1000),
        },
        process.env.SECRET
    );
};

// *** --- call back function when auth information required, retrieve user information in json  ---
UserSchema.methods.toAuthJSON = function () {
    return {
        uid: this._id,
        userid: this.userid,
        name: this.name,
        email: this.email,
        createdate: this.createdate,
        lastlogindate: this.lastlogindate,
        lastloginip: this.lastloginip,
        token: this.generateJWT(),
    };
};

module.exports = mongoose.model('UserSchema', UserSchema);

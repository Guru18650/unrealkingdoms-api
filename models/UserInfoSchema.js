//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- initialize variables --- 
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// *** --- define user info schema  --- 
const UserInfoSchema = new mongoose.Schema(
    {
        userid: { type: Number, min: 0, max: 9999 },
        race: { type: String },
        classe: { type: String },
        gender: { type: String }

        // maybe a few more in the later
    },
    {
        timestamps: true,
    }
);

// *** --- setup user info model validator  ---
UserInfoSchema.plugin(uniqueValidator, { message: "is already taken" });

// *** --- call back function when user info required, retrieve user type in json  ---
UserInfoSchema.methods.toUserInfoJSON = function () {
    return {
        uid: this._id,
        userid: this.userid,
        race: this.race,
        class: this.class,
        gender: this.gender,
    };
};

// *** --- export user info schema to use in controller ---
module.exports = mongoose.model('UserInfoSchema', UserInfoSchema);

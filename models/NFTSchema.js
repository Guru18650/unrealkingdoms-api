//********** Authored by: Alex *********//
//********** Date: September, 2022 *********//
//********** Organization: Cyber Ape Yacht Club *********//

// *** --- initialize variables --- 
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
require("dotenv/config");

// *** --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
// *** --- NFT Schema : One wallet can have multiple NFTs ---
// *** --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 

// *** --- define nft schema  --- 
const NFTSchema = new mongoose.Schema(
    {
        wallet: {
            type: String,
            lowercase: true,
            required: true,
            default: "0x000000000000000000000000000000000000dEaD"
        },
        nftcontract: {
            type: String,
            lowercase: true,
            required: true,
            default: "0x000000000000000000000000000000000000dEaD"
        }
    },
    {
        timestamps: true,
    }
);

// *** --- setup nft model validator ---
NFTSchema.plugin(uniqueValidator, { message: "is already taken" });

// *** --- response function when NFT information required, retrieve NFT information in json ---
NFTSchema.methods.toNFTJSON = function () {
    return {
        uid: this._id,
        wallet: this.wallet,
        nftcontract: this.nftcontract,
    };
};

// *** --- export nft schema to use in controller ---
module.exports = mongoose.model('NFTSchema', NFTSchema);

const mongoose = require("mongoose")



const user = mongoose.Schema({

    user_id: String,
    telegram_id: String,
    vip: { type: Boolean, default: false },
    vip_until: { type: Number, default: 0 },
    asset: { type: Number, default: 0 },
    free_asset_used: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    access: { type: Number, default: 0 }


})


module.exports = mongoose.model("User", user)
const mongoose = require("mongoose")



const files = mongoose.Schema({
    user_id: String,
    file_types: Number,
    Meterage: Number,
    price_sell: { type: Number, default: 0 },
    price_advance: { type: Number, default: 0 },
    price_rent: { type: Number, default: 0 },
    price_mortgage: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    images: { type: Array, default: [] },
    state: { type: String, default: "زنجان" },
    city: String,
    area: String,
    info: String,
    submitted_at:Number,
    address:String

})


module.exports = mongoose.model("Files", files)
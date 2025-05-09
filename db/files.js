const mongoose = require("mongoose")



const files = mongoose.Schema({
    user_id: String,
    home_type: Number,
    Meterage: Number,
    session_id:String,
    price_buy: { type: Number, default: 0 },
    price_advance: { type: Number, default: 0 },
    price_rent: { type: Number, default: 0 },
    price_mortgage: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
    pay: { type: Boolean, default: false },
    images: { type: Array, default: [] },
    state: { type: String, default: "زنجان" },
    city: String,
    areas: String,
    district: String,
    info: String,
    submitted_at:Number,
    address:String

})


module.exports = mongoose.model("Files", files)
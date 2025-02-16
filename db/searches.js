const mongoose = require("mongoose")



const searches = mongoose.Schema({

    user_id: String,
    session_id: String,
    state: { type: String, default: "زنجان" },
    city: String,
    areas: Array,
    date: Number,
    home_type:Number,
    district: String,

    budget_buy: { type: Number, default: 0 },
    budget_advance: { type: Number, default: 0 },
    budget_rent: { type: Number, default: 0 },
    budget_mortgage: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    pay: { type: Boolean, default: false },


})


module.exports = mongoose.model("Searches", searches)
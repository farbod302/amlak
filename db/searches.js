const mongoose = require("mongoose")



const searches = mongoose.Schema({

    user_id: String,
    state:{type:String,default:"زنجان"},
    city:String,
    areas:Array,
    date:Number,
    budget_buy: { type: Number, default: 0 },
    budget_advance: { type: Number, default: 0 },
    budget_rent: { type: Number, default: 0 },
    budget_mortgage: { type: Number, default: 0 },
    active: { type: Boolean, default: true },


})


module.exports = mongoose.model("Searches", searches)
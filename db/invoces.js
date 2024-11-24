const mongoose = require("mongoose")



const invoice = mongoose.Schema({
    user_id: String,
    amount:Number,
    date:Number,
    status:Number,
})


module.exports = mongoose.model("Invoice", invoice)
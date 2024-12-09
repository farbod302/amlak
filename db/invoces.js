const mongoose = require("mongoose")



const invoice = mongoose.Schema({
    telegram_id: String,
    amount:Number,
    date:Number,
    status:Number,
    invoice_id:String
})


module.exports = mongoose.model("Invoice", invoice)
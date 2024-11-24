const express = require("express")
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.json({ extend: true }))
require("dotenv").config()
const mongo = require("mongoose")
mongo.connect(process.env.DB)
const port = process.env.PORT
app.listen(port, () => { console.log("Server run on port " + port); })


app.get("*", (req, res) => {
    console.log(req);
    res.json(true)
})

app.post("*", (req, res) => {
    console.log(req);
    res.json(true)
})
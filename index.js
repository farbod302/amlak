const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fs=require("fs")

const https=require("https")
const conf = {
    key: fs.readFileSync("/etc/letsencrypt/live/netfan.org/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/netfan.org/fullchain.pem")
}
const server = https.createServer(conf, app);
const port = process.env.PORT

server.listen(port, () => { console.log("Server run on port " + port); })

app.use(bodyParser.json({ extend: true }))
require("dotenv").config()
const mongo = require("mongoose")
mongo.connect(process.env.DB)


app.get("*", (req, res) => {
    console.log(req);
    res.json(true)
})

app.post("*", (req, res) => {
    console.log(req);
    res.json(true)
})
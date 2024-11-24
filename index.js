const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fs=require("fs")
require("dotenv").config()

const https=require("https")
const conf = {
    key: fs.readFileSync("/etc/letsencrypt/live/netfan.org/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/netfan.org/fullchain.pem")
}
const server = https.createServer(conf, app);
const port = process.env.PORT

server.listen(port, () => { console.log("Server run on port " + port); })

app.use(bodyParser.json({ extend: true }))
const mongo = require("mongoose")
mongo.connect(process.env.DB)


app.get("*", (req, res) => {
    console.log(req.params);
    res.json(true)
})

app.post("*", (req, res) => {
    console.log(req.body);
    res.json(true)
})
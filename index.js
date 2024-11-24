const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fs = require("fs")
require("dotenv").config()

const https = require("https")
const conf = {
    key: fs.readFileSync("/etc/letsencrypt/live/netfan.org/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/netfan.org/fullchain.pem")
}
const server = https.createServer(conf, app);

const port = process.env.PORT

server.listen(port, () => { console.log("Server run on port " + port); })
// app.listen(port, () => { console.log("Server run on port " + port); })

app.use(bodyParser.json({ extend: true }))
const mongo = require("mongoose")
mongo.connect(process.env.DB)


const TelegramBot = require('node-telegram-bot-api');
const bot_handler = require("./container/bot_handler")

// Replace with your bot token
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { webHook: true });
bot.setWebHook('netfan.org', {
    certificate: '/etc/letsencrypt/live/netfan.org/cert.pem', // Path to your crt.pem
    secret_token:"/etc/letsencrypt/live/netfan.org/privkey.pem"

});
bot.addListener("message",(e)=>{
    console.log(e);
})
bot_handler.init(bot)
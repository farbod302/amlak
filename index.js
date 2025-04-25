const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const fs = require("fs")
const cors = require("cors")
app.use(cors())
require("dotenv").config()
const { CronJob } = require("cron")

const Users = require("./db/users")
const https = require("https")
// const conf = {
//     key: fs.readFileSync("/etc/letsencrypt/live/netfan.org/privkey.pem"),
//     cert: fs.readFileSync("/etc/letsencrypt/live/netfan.org/fullchain.pem")
// }
// const server = https.createServer(conf, app);

const port = process.env.PORT

// server.listen(port, () => { console.log("Server run on port " + port); })
app.listen(port, () => { console.log("Server run on port " + port); })

app.use(bodyParser.json({ extend: true }))
const mongo = require("mongoose")
mongo.connect(process.env.DB)


const TelegramBot = require('node-telegram-bot-api');
const bot_handler = require("./container/bot_handler")
app.use("/images", express.static("./images"))
// Replace with your bot token
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: { interval: 300, params: { timeout: 10 } } });
// bot.setWebHook('netfan.org', {
//     certificate: '/etc/letsencrypt/live/netfan.org/cert.pem', // Path to your crt.pem
//     url:"netfan.org"
// });
bot.on("polling_error", (msg) => console.log(msg));

bot_handler.init(bot)

const check_vip = async () => {
    const now = Date.now()
    await Users.updateMany({ vip: true, vip_until: { $lt: now } }, { $set: { vip: false } })
}

const job = new CronJob("0 * * * *", check_vip)
job.start()
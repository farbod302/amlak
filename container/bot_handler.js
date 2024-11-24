const messages = require("./messages");
const User = require("../db/users");
const { uid } = require("uid");
const bot_handler = {
    bot: null,
    init(bot) {
        this.bot = bot
        this.add_listeners()
    },
    session_steps: {},
    send_message(chatId, message_id) {
        const msg = messages[message_id]
        if (!msg) return
        this.bot.sendMessage(chatId, msg.text, msg.options)
    },
    add_listeners() {
        this.bot.onText(/\/start/, async (msg) => {
            const telegram_id = msg.from.id
            const is_exist = await User.findOne({ telegram_id })
            if (!is_exist) {
                const new_user = {
                    name: msg.from.first_name,
                    telegram_id,
                    user_id: uid(8)
                }
                await new User(new_user).save()
            }
            const chatId = msg.chat.id;
            this.session_steps[chatId] = null
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'ثبت آگهی', callback_data: 'submit_new_file' }],
                        [{ text: 'جست و جو ملک', callback_data: 'search' }],
                        [{ text: 'مالی', callback_data: 'payment' }],
                    ]
                }
            };

            this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
        });
        this.bot.on("callback_query", async (e) => {
            const { id } = e.from
            const chatId = e.message.chat.id
            const { data } = e;
            this.bot.answerCallbackQuery(e.id, { text: "درحال برسی..." })
            const user = await User.findOne({ telegram_id: id })
            if (!user) return
            const { phone } = user
            if (!phone) {
                this.send_message(chatId, "get_phone")
                this.session_steps[chatId] = { cur_step: "phone", nex_step: data }
                return
            }

            switch (data) {
                case ("search"): {
                    break
                }
            }
        })
        this.bot.on("message", (msg) => {
            const { id } = msg.from
            const session=this.session_steps[id]
            console.log({session});
        })
    }

}

module.exports = bot_handler
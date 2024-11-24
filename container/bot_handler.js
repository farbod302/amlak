const messages = require("./messages");

const bot_handler = {
    bot: null,
    init(bot) {
        this.bot = bot
        this.add_listeners()
    },

    send_message(chatId, message_id) {
        const msg = messages[message_id]
        if (!msg) return
        this.bot.sendMessage(chatId, msg.text, msg.options)
    },
    add_listeners() {
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'ثبت آگهی', callback_data: 'submit_new_file' }],
                        [{ text: 'جست و جو ملک', callback_data: 'search' }]
                    ]
                }
            };

            this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
        });
        this.bot.on("callback_query", (e) => {
            const chatId = e.message.chat.id
            const { data } = e;
            this.bot.answerCallbackQuery(e.id, { text: "درحال برسی..." })
            switch (data) {
                case ("search"): {
                    this.send_message(chatId,"get_phone")
                }
            }
        })
    }

}

module.exports = bot_handler
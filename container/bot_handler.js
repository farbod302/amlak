const bot_handler = {
    bot: null,
    init(bot) {
        this.bot = bot
        this.add_listeners()
    },
    add_listeners() {
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;

            // Define inline buttons
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Option 1', callback_data: '1' }],
                        [{ text: 'Option 2', callback_data: '2' }]
                    ]
                }
            };

            bot.sendMessage(chatId, 'Choose an option:', options);
        });
    }

}

module.exports=bot_handler
const bot_handler = {
    bot: null,
    init(bot) {
        this.bot = bot
        this.add_listeners()
    },
    add_listeners() {
        this.bot.onText(/\/start/, (msg) => {
            console.log({ msg });
            const chatId = msg.chat.id;

            // Define inline buttons
            const options = {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: 'Option 1', callback_data: '/search' }],
                    [{ text: 'Option 2', callback_data: '2' }]
                  ]
                }
              };

            this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
        });
        this.bot.onText(/\/search/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'شماره تماس شما در سیستم ثبت نشده.لطفا شماره تماس خود را وارد کنید');
        })
        this.bot.on("message",(e)=>{
            console.log(e);
        })
    }

}

module.exports = bot_handler
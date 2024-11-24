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
                    keyboard: [
                        [{ text: 'جستجو خانه', callback_data: '/search' }],
                        [{ text: 'ثبت آگهی', callback_data: '2' }]
                        [{ text: "مالی", callback_data: '3' }]
                    ],
                    resize_keyboard: true, // Adjusts keyboard to fit smaller screens
                    one_time_keyboard: true // Hides keyboard after use
                }
            };

            this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
        });
        this.bot.onText(/\/search/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'شماره تماس شما در سیستم ثبت نشده.لطفا شماره تماس خود را وارد کنید');
        })
    }

}

module.exports = bot_handler
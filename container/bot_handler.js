const messages = require("./messages");
const User = require("../db/users");
const Search = require("../db/searches");
const { uid } = require("uid");
const controllers = require("../controller");
const sessions_handler = require("./sessions_handler");
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
            const { phone, user_id } = user
            if (!phone) {
                this.send_message(chatId, "get_phone")
                this.session_steps[chatId] = { cur_step: "phone" }
                return
            }

            switch (data) {
                case ("search"): {
                    sessions_handler.create_session({ user_id: id, session_type: "search" })
                    this.send_message(chatId, "select_type")
                    this.session_steps[id] = { cur_step: "home_type" }
                    break
                }
            }
        })
        this.bot.on("message", async (msg) => {
            const { id } = msg.from
            const chatId = msg.chat.id

            const session = this.session_steps[id]
            if (!session) {
                return
            }

            switch (msg.text) {
                case ("ثبت مناطق"): {
                    const cur_session = sessions_handler.get_session(id)
                    const { areas } = cur_session
                    this.bot.sendMessage(chatId, `منطقه: ${areas.join(", ")}`)
                    const { home_type } = cur_session
                    console.log({ home_type });
                    if (home_type == 1) {
                        this.session_steps[id] = { cur_step: "budget_advance" }
                        this.send_message(id, "budget_advance")
                    }
                    return
                }
                default: {
                    break
                }
            }

            const { cur_step } = session
            switch (cur_step) {
                case ("phone"): {
                    const is_valid = controllers.phone(msg.text)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_phone")
                        return
                    }
                    await User.findOneAndUpdate({ telegram_id: id }, { $set: { phone: msg.text } })
                    this.session_steps[id] = null
                    this.send_message(chatId, "phone_submitted")
                    break
                }
                case ("home_type"): {
                    const res = sessions_handler.edit_session({ user_id: id, data: { home_type: msg.text.split("-")[0] } })
                    console.log({ res });
                    this.send_message(chatId, "select_city")
                    this.session_steps[id] = { cur_step: "city" }
                    break
                }
                case ("city"): {
                    const city = msg.text
                    sessions_handler.edit_session({ user_id: id, data: { city: msg.text } })
                    this.send_message(chatId, city === "ابهر" ? "select_area_abhar" : "select_area_khoramdare")
                    this.session_steps[id] = { cur_step: "area" }
                    break
                }
                case ("budget_advance"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    sessions_handler.edit_session({ user_id: id, data: { budget_advance: +msg.text } })
                    this.session_steps[id] = { cur_step: "budget_rent" }
                    this.send_message(id,"budget_rent")
                    break
                }
                case ("budget_rent"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    sessions_handler.edit_session({ user_id: id, data: { budget_rent: +msg.text } })
                    this.session_steps[id] = null
                    const session = sessions_handler.get_session(id)
                    const new_search = { ...session }
                    console.log({ new_search });
                    await new Search(new_search).save()
                    const message = `درخواست شما ثبت شد\nملک جهت: ${new_search.home_type == 1 ? "اجاره" : new_search.home_type == 2 ? "خرید" : "رهن"}\n
                    شهر:${new_search.city}
                    مناطق:${new_search.areas.join(", ")}
                    بودجه:\n 
                    ${new_search.budget_buy ? new_search.budget_buy + "تومان بودجه خرید \n" : ""}
                    ${new_search.budget_advance ? new_search.budget_advance + "تومان بودجه پیش پرداخت \n" : ""}
                    ${new_search.budget_rent ? new_search.budget_rent + "تومان بودجه اجاره ماهانه \n" : ""}
                    ${new_search.budget_mortgage ? new_search.budget_mortgage + "تومان بودجه رهن \n" : ""}
                    `
                    const options = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "جست و جو ملک های مناسب من", callback_data: '#search_' + new_search.session_id }],
                                [{ text: 'بازگشت به صفحه اصلی', callback_data: 'search' }],
                            ]
                        }
                    }
                    this.bot.sendMessage(id, message,options)
                    break
                }

                case ("area"): {
                    const cur_session = sessions_handler.get_session(id)
                    if (!cur_session.areas) {
                        sessions_handler.edit_session({ user_id: id, data: { areas: [msg.text] } })
                    } else {
                        if (cur_session.areas.includes(msg.text)) return this.bot.sendMessage(chatId, `منطقه قبلا انتخاب شده`)
                        sessions_handler.edit_session({ user_id: id, data: { areas: [...cur_session.areas, msg.text] } })
                    }
                    this.bot.sendMessage(chatId, `اگر مناطق دیگر مد نظر شما است انتخاب کنید و یا ثبت منطقه را انتخاب کنید`)

                    break
                }

            }
        })
    }

}

module.exports = bot_handler
const messages = require("./messages");
const User = require("../db/users");
const Search = require("../db/searches");
const { uid } = require("uid");
const controllers = require("../controller");
const sessions_handler = require("./sessions_handler");
const fs = require("fs")
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
    async submit_search(id) {
        const session = sessions_handler.get_session(id)
        const new_search = { ...session }
        console.log({ new_search });
        await new Search(new_search).save()
        const message = `درخواست شما ثبت شد\nملک جهت: ${new_search.home_type == 1 ? "اجاره" : new_search.home_type == 2 ? "خرید" : "رهن"}\n
        شهر:${new_search.city}
        مناطق:${new_search.areas.join(", ")}
        بودجه:\n 
        ${new_search.budget_buy ? new_search.budget_buy + "تومان بودجه خرید " : ""}
        ${new_search.budget_advance ? new_search.budget_advance + "تومان بودجه پیش پرداخت " : ""}
        ${new_search.budget_rent ? new_search.budget_rent + "تومان بودجه اجاره ماهانه " : ""}
        ${new_search.budget_mortgage ? new_search.budget_mortgage + "تومان بودجه رهن " : ""}
        `
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "جست و جو ملک های مناسب من", callback_data: '#search_' + new_search.session_id }],
                    [{ text: 'بازگشت به صفحه اصلی', callback_data: 'home' }],
                ]
            }
        }
        this.bot.sendMessage(id, message, options)
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
                case ("submit_new_file"): {
                    sessions_handler.create_session({ user_id: id, session_type: "submit_new_file" })
                    this.send_message(chatId, "select_type_submit")
                    this.session_steps[id] = { cur_step: "home_type" }
                    break
                }
                case ("upload_image"): {
                    this.session_steps[chatId] = { cur_step: "upload_image" }
                    this.send_message(chatId, "send_images")
                    const session=sessions_handler.get_session(id)
                    fs.mkdirSync("./images/" + session.session_id)
                    break
                }
                case ("home"): {
                    this.session_steps[chatId] = null
                    const options = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'ثبت آگهی', callback_data: 'submit_new_file' }],
                                [{ text: 'جست و جو ملک', callback_data: 'search' }],
                                [{ text: 'مالی', callback_data: 'payment' }],
                            ],
                            remove_keyboard: true
                        }
                    };
                    this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
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
                    if (home_type == 2) {
                        this.session_steps[id] = { cur_step: "budget_buy" }
                        this.send_message(id, "budget_buy")
                    }
                    if (home_type == 3) {
                        this.session_steps[id] = { cur_step: "budget_mortgage" }
                        this.send_message(id, "budget_mortgage")
                    }
                    return
                }
                default: {
                    break
                }
            }

            const { cur_step } = session
            console.log({ cur_step });
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
                    this.send_message(chatId, "select_city")
                    this.session_steps[id] = { cur_step: "city" }
                    break
                }
                case ("city"): {
                    const city = msg.text
                    const session = sessions_handler.edit_session({ user_id: id, data: { city: msg.text } })
                    if (session.session_type === "submit_new_file") {
                        this.session_steps[id] = { cur_step: "single_area" }
                        this.send_message(chatId, city === "ابهر" ? "select_area_abhar_single" : "select_area_khoramdare_single")

                    } else {
                        this.session_steps[id] = { cur_step: "area" }
                        this.send_message(chatId, city === "ابهر" ? "select_area_abhar" : "select_area_khoramdare")


                    }
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
                    this.send_message(id, "budget_rent")
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
                    this.submit_search(id)
                    break
                }
                case ("budget_buy"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    sessions_handler.edit_session({ user_id: id, data: { budget_buy: +msg.text } })
                    this.session_steps[id] = null
                    this.submit_search(id)
                    break
                }
                case ("budget_mortgage"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    sessions_handler.edit_session({ user_id: id, data: { budget_mortgage: +msg.text } })
                    this.session_steps[id] = null
                    this.submit_search(id)
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
                case ("single_area"): {
                    sessions_handler.edit_session({ user_id: id, data: { are: msg.text } })
                    this.session_steps[id] = { cur_step: "address" }
                    this.send_message(chatId, "address")
                    break
                }
                case ("address"): {
                    sessions_handler.edit_session({ user_id: id, data: { address: msg.text } })
                    console.log("address resived");
                    this.session_steps[id] = { cur_step: "images_req" }
                    this.send_message(chatId, "images_req")
                    break
                }
                case ("info"): {
                    sessions_handler.edit_session({ user_id: id, data: { info: msg.text } })
                    this.session_steps[id] = "images"
                    this.send_message(chatId, "image")
                    break
                }
                case ("upload_image"): {
                    console.log(msg);
                    const { photo } = msg
                    if (!photo) return this.send_message(chatId, "invalid_photo")
                    const last = photo.at(-1)
                    const session = sessions_handler.get_session(id)
                    const { session_id } = session
                    
                    this.bot.downloadFile(last.file_id, "./images/" + session_id)
                    const folder=fs.readdirSync( "./images/" + session_id)
                    console.log({folder});
                    break
                }

            }
        })
    }

}

module.exports = bot_handler
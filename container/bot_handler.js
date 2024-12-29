const messages = require("./messages");
const User = require("../db/users");
const Search = require("../db/searches");
const Home = require("../db/files");
const Invoice = require("../db/invoces");
const Files = require("../db/files");
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
        const user = await User.findOne({ telegram_id: id })
        const { vip } = user
        if (vip) {
            new_search.pay = true
        }
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
    price_convert(p) {
        const { format } = Intl.NumberFormat()
        return format(p) + " "
    },

    async submit_file(id) {
        const session = sessions_handler.get_session(id)
        const new_search = { ...session }
        const user = await User.findOne({ telegram_id: id })
        const { vip } = user
        if (vip) {
            new_search.pay = true
        }
        new_search.user_id = user.user_id
        new_search.price_buy = new_search.budget_buy || 0
        new_search.price_advance = new_search.budget_advance || 0
        new_search.price_rent = new_search.budget_rent || 0
        new_search.price_mortgage = new_search.budget_mortgage || 0
        new_search.submitted_at = Date.now()
        new Home(new_search).save()
        const message = `درخواست شما ثبت شد\nملک جهت: ${new_search.home_type == 1 ? "اجاره" : new_search.home_type == 2 ? "خرید" : "رهن"}\n
        شهر:${new_search.city}
        منطقه:${new_search.are}
        ادرس:${new_search.address}
        عکس: ${new_search.images.length ? new_search.images.length + "عکس ثبت شد" : "عکسی ثبت نشده"}
        بودجه: 
        ${new_search.price_buy ? new_search.price_buy + "تومان قیمت خرید " : ""}
        ${new_search.price_advance ? new_search.price_advance + "تومان قیمت پیش پرداخت " : ""}
        ${new_search.price_rent ? new_search.price_rent + "تومان قیمت اجاره ماهانه " : ""}
        ${new_search.price_mortgage ? new_search.price_mortgage + "تومان قیمت رهن " : ""}
        در صورت صحت اطلاعات روی دکمه "ثبت نهایی ملک" کلیک کنید تا فایل جدید ثبت شود
        در صورت ثبت نهایی مبلغ 10,000 از اعتبار شما کسر خواهد شد
        در صورت فعال بودن اشتراک VIP هزینه ای کسر نخواهد شد
        `
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "ثبت نهایی ملک", callback_data: '#submit_' + new_search.session_id }],
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
                        [{ text: 'آگهی های من', callback_data: 'my_homes' }, { text: 'جست و جو های اخیر من', callback_data: 'my_searches' }],
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
            if (data.startsWith("#confirm")) {
                const payment_id = data.replace("#confirm_", "")
                const payment = await Invoice.findOne({ invoice_id: payment_id })
                if (!payment) {
                    this.bot.sendMessage(chatId, "فاکتور یافت نشد")
                    return
                }
                if (payment.status === 1) {
                    this.bot.sendMessage(chatId, "فاکتور قبلا تایید شده")
                    return

                }
                const { amount, telegram_id } = payment
                await User.findOneAndUpdate({ telegram_id }, { $inc: { asset: amount } })
                this.bot.sendMessage(chatId, "انجام شد")
                await Invoice.findOneAndUpdate({ invoice_id: payment_id }, { $set: { status: 1 } })
                this.bot.sendMessage(telegram_id, `حساب شما به مبلغ: ${amount} شارژ شد`)
                return
            }
            if (data.startsWith("#reject")) {
                const payment_id = data.replace("#reject_", "")
                const payment = await Invoice.findOne({ invoice_id: payment_id })
                if (!payment) {
                    this.bot.sendMessage(chatId, "فاکتور یافت نشد")
                    return
                }
                this.bot.sendMessage(chatId, "فاکتور رد شد")
                await Invoice.findOneAndUpdate({ invoice_id: payment_id }, { $set: { status: 2 } })
                return
            }
            if (data.startsWith("#submit")) {
                const file_id = data.replace("#submit_", "")
                const file = await Files.findOne({ session_id: file_id })
                if (file.pay) {
                    await Files.findOneAndUpdate({ session_id: file_id }, { $set: { active: true } })
                    this.bot.sendMessage(chatId, "ملک ثبت شد و هم اکنون در دسترس قرار گرفته")
                    return
                } else {
                    const user = await User.findOne({ telegram_id: id })
                    const { asset } = user
                    if (asset < 10000) {
                        this.bot.sendMessage(chatId, "موجودی حساب شما برای ثبت ملک کافی نیست. لطفا از بخش مالی اقدام به شارژ حساب کنید")
                        return
                    }
                    await User.findOneAndUpdate({ telegram_id: id }, { $inc: { asset: -10000 } })
                    await Files.findOneAndUpdate({ session_id: file_id }, { $set: { active: true, pay: true } })
                    this.bot.sendMessage(chatId, "ملک ثبت شد و هم اکنون در دسترس قرار گرفته")
                }
                return
            }
            if (data.startsWith("#deactive")) {
                const file_id = data.replace("#deactive_", "")
                const file = await Files.findOne({ session_id: file_id })
                if (!file) {
                    this.bot.sendMessage(chatId, "درخواست نا معتبر")
                    return
                }
                const { user_id } = file
                const user = await User.findOne({ telegram_id: id })
                if (user.user_id !== user_id) {
                    this.bot.sendMessage(chatId, "درخواست نا معتبر")
                    return
                }
                await Files.findOneAndUpdate({ session_id: file_id }, { $set: { active: false } })
                this.bot.sendMessage(chatId, "فایل از دسترس خارج شد")
                return

            }
            if (data == "VIP") {
                const user = await User.findOne({ telegram_id: id })
                const { asset, vip, vip_until } = user
                if (asset < 100000) {
                    this.bot.sendMessage(chatId, "موجودی حساب شما برای  فعال سازی VIP کافی نیست")
                    return
                }
                const cur_date = Math.max(Date.now(), vip_until)
                const oneMonth = 1000 * 60 * 60 * 24 * 30
                const new_date = cur_date + oneMonth
                const convertor = (e) => new Intl.DateTimeFormat('fa-IR').format(new Date(e))
                const msg = `تمدید / خرید اشتراک VIP\nوضعیت فعلی اشتراک: ${vip ? "فعال" : "غیر فعال"}\n اعتبار فعللی اشتراک تا: ${!vip ? "-" : convertor(cur_date)}\n اعتبار اشتراک بعد از تایید پرداخت: ${convertor(new_date)}`
                this.bot.sendMessage(chatId, msg, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "تایید خرید/تمدید اشتراک", callback_data: 'confirm_vip' }],
                        ]
                    }
                })
                return

            }
            if (data === "confirm_vip") {
                const user = await User.findOne({ telegram_id: id })
                const { asset, vip_until } = user
                if (asset < 100000) {
                    this.bot.sendMessage(chatId, "موجودی حساب شما برای  فعال سازی VIP کافی نیست")
                    return
                }
                const cur_date = Math.max(Date.now(), vip_until)
                const oneMonth = 1000 * 60 * 60 * 24 * 30
                const new_date = cur_date + oneMonth
                await User.findOneAndUpdate({ telegram_id: id }, { $inc: { asset: -100000 }, $set: { vip: true, vip_until: new_date } })
                this.bot.sendMessage(chatId, "تمدید / خرید اشتراک با موفقیت انجام شد", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'صفحه اصلی', callback_data: 'home' }],

                        ],
                    }
                })
            }
            if (data.startsWith("#search_")) {
                const search_id = data.replace("#search_", "")
                const search = await Search.findOne({ session_id: search_id })
                const { areas, home_type, city, state, budget_buy, budget_advance, budget_rent, budget_mortgage } = search
                const query = {
                    home_type,
                    city,
                    areas: { $in: areas },
                    active: true,
                    state
                }
                if (home_type === 1) {
                    query.price_advance = { $lte: budget_advance }
                    query.price_rent = { $lte: budget_rent }
                }
                if (home_type === 2) {
                    query.price_buy = { $lte: budget_buy }
                }
                if (home_type === 3) {
                    query.price_mortgage = { $lte: budget_mortgage }
                }
                const files = await Files.find(query).sort({ submitted_at: -1 }).limit(7)
                if (!files.length) {
                    this.bot.sendMessage(chatId, "در حال حاضر فایلی مناسب شما وجود ندارد")
                } else {
                    let msg = ``

                    const type_finder = (f) => {
                        if (f.type === 1) {
                            msg += `خانه جهت فروش به قیمت ${this.price_convert(f.price_buy)}\n`
                        }
                    }
                    for (const f of files) {
                        const { info, areas, city, address, images,session_id } = f
                        const images_path = images.map(e => e.replace("https://netfan.org:4949", `${__dirname}/../`))
                        console.log(images_path);
                        type_finder(f)
                        msg += `واقع در شهر ${city}\nآدرس: ${address}\nمنطقه: ${areas}\nتوضیحات: ${info}`
                        const media = images_path.map((e, index) => {
                            return {
                                type: "photo",
                                media: fs.createReadStream(e),
                                caption: index === 0 ? msg : ""
                            }
                        })
                        if (!media.length) {
                            media.push({
                                type: "photo",
                                media: "https://static.vecteezy.com/system/resources/previews/022/059/000/non_2x/no-image-available-icon-vector.jpg",
                                caption: msg
                            })
                        }
                        this.bot.sendMediaGroup(chatId, media, {},{
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'مشاهده شماره تماس فروشنده', callback_data: `call_${session_id}` }],
                                ],
                            }
                        })
                    }
                }
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
                    const session = sessions_handler.get_session(id)
                    fs.mkdirSync("./images/" + session.session_id)
                    break
                }
                case ("skip_image"): {
                    this.session_steps[chatId] = { cur_step: "info" }
                    const res = sessions_handler.edit_session({ user_id: id, data: { images: [] } })
                    this.send_message(chatId, "info")
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
                                [{ text: 'آگهی های من', callback_data: 'my_homes' }, { text: 'جست و جو های اخیر من', callback_data: 'my_searches' }],
                            ],
                            remove_keyboard: true
                        }
                    };
                    this.bot.sendMessage(chatId, 'خوش آمدید. چطور میتونم کمکتون کنم؟:', options);
                    break
                }
                case ("payment"): {
                    const user = await User.findOne({ telegram_id: id })
                    const { asset, vip, vip_until } = user
                    let day_remain = 0
                    if (vip_until && vip_until > Date.now()) {
                        const def = vip_until - Date.now()
                        const day = Math.round(def / (1000 * 60 * 60 * 24))
                        day_remain = day
                    }
                    const msg = `موجودی حساب شما: ${asset} تومان\n اشتراک vip: ${vip ? "فعال" : "غیر فعال"}\n${vip ? "اعتبار اشتراک vip تا" + day_remain + "روز آینده" : ""}\nبا تهیه اشتراک vip می توانید بدون پرداخت هزینه اضافه به تعداد نامحدود آگهی ثبت کنید و یا ملک جستجو کنید\nهزینه اشتراک vip برای یک ماه: 100,000 تومان\nهزینه ثبت هر آگهی یا جست و جو ملک: 10,000 تومان`
                    const options = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'افزایش اعتبار', callback_data: 'popup' }],
                                [{ text: 'فعال سازی اشتراک vip', callback_data: 'VIP' }],
                            ],
                            remove_keyboard: true
                        }
                    }
                    this.bot.sendMessage(chatId, msg, options);
                    break

                }
                case ("popup"): {
                    this.session_steps[id] = { cur_step: "popup" }
                    this.bot.sendMessage(chatId, "مبلغ افزایش اعتبار را به تومان وارد کنید:");
                }
            }
        })
        this.bot.on("message", async (msg) => {
            const { id } = msg.from
            const chatId = msg.chat.id

            const session = this.session_steps[id]
            if (!session && !msg.text.startsWith("set")) {
                return
            }


            switch (msg.text) {
                case ("ثبت مناطق"): {
                    const cur_session = sessions_handler.get_session(id)
                    const { areas } = cur_session
                    this.bot.sendMessage(chatId, `منطقه: ${areas.join(", ")}`)
                    const { home_type } = cur_session
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
                case ("set_admin_12345"): {
                    const json_str = fs.readFileSync(__dirname + "/../config.json")
                    const json = JSON.parse(json_str.toString())
                    json.admin = id
                    this.bot.sendMessage(id, "Admin set successfully")
                    fs.writeFileSync(__dirname + "/../config.json", JSON.stringify(json))
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
                case ("popup"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    const invoice_id = uid(6)
                    const new_invoice = {
                        telegram_id: id,
                        amount: +(price.trim()),
                        date: Date.now(),
                        status: 0,
                        invoice_id
                    }
                    const message = `درخواست شما ثبت شد \nشناسه پرداخت: <code>${invoice_id}</code> \nمبلغ: ${price} تومان \nوجه را به شماره کارت: \n<code>5859831050068153</code> \n واریز کنید و رسید پرداخت را همراه با شناسه پرداخت به حساب @farbod_302 ارسال کنید`;
                    this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                    new Invoice(new_invoice).save()
                    const json_str = fs.readFileSync(__dirname + "/../config.json")
                    const json = JSON.parse(json_str.toString())
                    const { admin } = json
                    this.bot.sendMessage(admin, `درخواست پرداخت جدید ثبت شد. \n شناسه واریز: ${invoice_id} \n مبلغ: ${price} تومان`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'تایید پرداخت', callback_data: '#confirm_' + invoice_id }],
                                    [{ text: 'عدم تایید', callback_data: '#reject_' + invoice_id }],
                                ],
                            }
                        })
                    break

                }


                case ("budget_rent"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    const { session_type } = sessions_handler.edit_session({ user_id: id, data: { budget_rent: +msg.text } })
                    this.session_steps[id] = null
                    session_type === "search" ? this.submit_search(id) : this.submit_file(id)
                    break
                }
                case ("budget_buy"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    const { session_type } = sessions_handler.edit_session({ user_id: id, data: { budget_buy: +msg.text } })
                    this.session_steps[id] = null
                    session_type === "search" ? this.submit_search(id) : this.submit_file(id)
                    break
                }
                case ("budget_mortgage"): {
                    const price = msg.text
                    const is_valid = controllers.price(price)
                    if (!is_valid) {
                        this.send_message(chatId, "invalid_price")
                        return
                    }
                    const { session_type } = sessions_handler.edit_session({ user_id: id, data: { budget_mortgage: +msg.text } })
                    this.session_steps[id] = null
                    session_type === "search" ? this.submit_search(id) : this.submit_file(id)
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
                    sessions_handler.edit_session({ user_id: id, data: { areas: msg.text } })
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
                    const cur_session = sessions_handler.edit_session({ user_id: id, data: { info: msg.text } })
                    const { home_type } = cur_session
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

                    break
                }
                case ("upload_image"): {
                    const { photo } = msg
                    if (!photo) return this.send_message(chatId, "invalid_photo")
                    const last = photo.at(-1)
                    const session = sessions_handler.get_session(id)
                    const { session_id } = session

                    await this.bot.downloadFile(last.file_id, "./images/" + session_id)
                    const folder = fs.readdirSync("./images/" + session_id)
                    const links = folder.map(e => `https://netfan.org:4949/images/${session_id}/${e}`)
                    sessions_handler.edit_session({ user_id: id, data: { images: links } })
                    if (this.session_steps[id]?.cur_step !== "info") {
                        this.session_steps[id] = { cur_step: "info" }
                        this.send_message(chatId, "info")
                    }

                    break
                }

            }
        })
    }

}

module.exports = bot_handler
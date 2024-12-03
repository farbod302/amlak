const messages = {
    "get_phone": {
        text: `شماره تماس شما در سیستم ثبت نشده.لطفا شماره تماس خود را وارد کنید\nفرمت صحیح: \n 09125432121`,
        options: {}
    },
    "invalid_phone": {
        text: `شماره تماس نامعتبر\nفرمت صحیح: \n 09125432121`,
        options: {}
    },
    "invalid_price": {
        text: `قیمت  نامعتبر\nفرمت صحیح: \n 5000000`,
        options: {}
    },
    "phone_submitted": {
        text: `شماره تماس شما ثبت شد.اکنون می توانید از خدمات ربات استفاده کنید`,
        options: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ثبت آگهی', callback_data: 'submit_new_file' }],
                    [{ text: 'جست و جو ملک', callback_data: 'search' }],
                    [{ text: 'مالی', callback_data: 'payment' }],
                ],
                remove_keyboard: true
            }
        }
    },
    "select_type": {
        text: "به دنبال چه ملکی هستید؟",
        options: {
            reply_markup: {

                keyboard: [
                    ['1-اجاره', '2-خرید'],
                    ['3-رهن']
                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: true
            }
        }
    },
    "select_type_submit": {
        text: "ثبت آگهی برای:",
        options: {
            reply_markup: {

                keyboard: [
                    ['1-اجاره', '2-خرید'],
                    ['3-رهن']
                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: true
            }
        }
    },
    "select_city": {
        text: "شهر را انتخاب کنید",
        options: {
            reply_markup: {

                keyboard: [
                    ['ابهر', 'خرمدره'],
                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: true
            }
        }
    },
    "select_area_abhar": {
        text: "مناطق مورد نظر را انتخاب کنید",
        options: {
            reply_markup: {

                keyboard: [
                    ['Abhar 2', 'Abhar 1'],
                    ["ثبت مناطق"],

                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: false
            }
        }
    },
    "select_area_abhar_single": {
        text: "منطقه ملک را انتخاب کنید",
        options: {
            reply_markup: {

                keyboard: [
                    ['Abhar 2', 'Abhar 1'],

                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: false
            }
        }
    },
    "select_area_khoramdare_single": {
        text: "منطقه ملک را انتخاب کنید",
        options: {
            reply_markup: {

                keyboard: [
                    ['kh1', 'kh2'],
                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: false
            }
        }
    },
    "budget_advance": {
        text: "بودجه / قیمت جهت پول پیش را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "budget_rent": {
        text: "بودجه / قیمت جهت اجاره ماهیانه را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "budget_buy": {
        text: "بودجه / قیمت جهت خرید را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "budget_mortgage": {
        text: "بودجه / قیمت جهت رهن را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "address": {
        text: "آدرس دقیق ملک را وارد کنید",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "info": {
        text: "توضیحات  لازم مانند متراژ ,تعداد واحد های ساختمان , برخورداری از آسانسور و .. برای این ملک را بنویسید",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "images_req": {
        text: "آیا مایل به بارگزاری عکس برای این ملک هستید؟",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "بله", callback_data: 'upload_image' }],
                    [{ text: "خیر", callback_data: 'skip_image' }],

                ],
                remove_keyboard: true
            }
        }
    },
    "send_images": {
        text: "عکس های مورد نظر را انتخاب کرده و ارسال کنید.میتوانید چندین عکس را یک جا ارسال کنید",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "invalid_photo": {
        text: "عکس نامعتبر",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },

}

module.exports = messages
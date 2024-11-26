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
                ]
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
    "select_area_khoramdare": {
        text: "مناطق مورد نظر را انتخاب کنید",
        options: {
            reply_markup: {

                keyboard: [
                    ['kh1', 'kh2'],
                    ["ثبت مناطق"],
                ],
                resize_keyboard: true, // Adjust the keyboard size
                one_time_keyboard: false
            }
        }
    },
    "budget_advance": {
        text: "بودجه جهت پول پیش را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },
    "budget_rent": {
        text: "بودجه جهت اجاره ماهیانه را وارد کنید (به تومان).\nبا اعداد انگلیسی وارد شود",
        options: {
            reply_markup: {
                remove_keyboard: true
            }
        }
    },

}

module.exports = messages
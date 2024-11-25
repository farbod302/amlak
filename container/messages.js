const messages = {
    "get_phone": {
        text: `شماره تماس شما در سیستم ثبت نشده.لطفا شماره تماس خود را وارد کنید\nفرمت صحیح: \n 09125432121`,
        options: {}
    },
    "invalid_phone": {
        text: `شماره تماس نامعتبر\nفرمت صحیح: \n 09125432121`,
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
    }

}

module.exports = messages
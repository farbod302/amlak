const controllers = {
    phone(phone) {
        if (phone.length !== 11 && !phone.startsWith("09")) {
            return false
        }
        return true
    },
    price(num) {
        if(!num)return false
        return /^-?\d+$/.test(num.replaceAll(",", ""));
    }
}

module.exports = controllers
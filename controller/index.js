const controllers = {
    phone(phone) {
        if (phone.length !== 11 && !phone.startsWith("09")) {
            return false
        }
        return true
    },
    price(num){
        if(typeof +num === "number")return true
        return false
    }
}

module.exports = controllers
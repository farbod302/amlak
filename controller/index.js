const controllers = {
    phone(phone) {
        console.log("phone");
        if (phone.length !== 11 && !phone.startsWith("09")) {
            return false
        }
        return true
    }
}

module.exports = controllers
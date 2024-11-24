const { uid } = require("uid")
const fs = require("fs")
const sessions_handler = {
    create_session({ user_id, session_type }) {
        const session_id = uid(8)
        const new_session = { user_id, session_id, session_type, finish: false, date: Date.now() }
        const json_str = fs.readFileSync("./sessions.json")
        const json = JSON.parse(json_str.toString())
        json.push(new_session)
        fs.writeFileSync("./sessions.json", JSON.stringify(json))
    },
    edit_session({ session_id, data }) {
        const json_str = fs.readFileSync("./sessions.json")
        const json = JSON.parse(json_str.toString())
        const session = json.find(e => e.session_id === session_id)
        if (!session) return false
        const keys = Object.keys(data)
        const prv_data = { ...session }
        keys.forEach(e => prv_data[e] = data[e])
        const new_json = json.filter(e => e.session_id !== session_id)
        new_json.push(prv_data)
        fs.writeFileSync("./sessions.json", JSON.stringify(new_json))
        return prv_data
    }
}

module.exports = sessions_handler
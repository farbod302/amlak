const { uid } = require("uid")
const fs = require("fs")
const sessions_handler = {
    create_session({ user_id, session_type }) {
        const session_id = uid(8)
        const new_session = { user_id, session_id, session_type, finish: false, date: Date.now() }
        const json_str = fs.readFileSync(`${__dirname}/sessions.json`)
        let json = JSON.parse(json_str.toString())
        json = json.filter(e => e.user_id !== user_id)
        json.push(new_session)
        fs.writeFileSync(`${__dirname}/sessions.json`, JSON.stringify(json))
        return session_id
    },
    edit_session({ user_id, data }) {
        const json_str = fs.readFileSync(`${__dirname}/sessions.json`)
        const json = JSON.parse(json_str.toString())
        const session = json.find(e => e.user_id === user_id)
        if (!session) return false
        const keys = Object.keys(data)
        const prv_data = { ...session }
        keys.forEach(e => prv_data[e] = data[e])
        const new_json = json.filter(e => e.user_id !== user_id)
        new_json.push(prv_data)
        fs.writeFileSync(`${__dirname}/sessions.json`, JSON.stringify(new_json))
        return prv_data
    },

}

module.exports = sessions_handler
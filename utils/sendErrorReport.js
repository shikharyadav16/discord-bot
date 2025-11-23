const { reportChannelId } = require('../config/channels');
const client = require('../services/discord')

class Report {

    constructor(type = "Unknow", message = "Unknow error") {
        this.type = type;
        this.message = message
    };

    send() {
        const channel = client.channels.fetch(reportChannelId);
        channel.send(`*${this.type}* : ${this.message}`);
    }
}

module.exports = Report;

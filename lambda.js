'use strict';
const https = require('https');
const querystring = require('querystring');
const message_data = require('./data.json');

const TOKEN = process.env.slack_token || '';

const SLACK = new slack(TOKEN);

function slack(token) {
    this.hostname = 'slack.com';
    this.token = token;
}

slack.prototype.request_option = function (method, path, payload) {
    if (payload && typeof payload == 'object') {
        payload.token = this.token
    }
    return {
        hostname: this.hostname,
        path: payload ? path + '?' + querystring.stringify(payload) : path,
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
}

slack.prototype.message = function (atHere, atSomeone, message) {
    // atHere > atSomeone
    let tag_people;
    if (atSomeone && typeof atSomeone === 'string') {
        tag_people = '';
        atSomeone.split(' ').map(value => {
            let tag_template = `<@${value}>`;
            tag_people += `${tag_template} `;
        });
    }
    return atHere ? `<!here> ${message}` : tag_people ? `${tag_people} ${message}` : message;
}

slack.prototype.test = function () {
    let options = this.request_option('POST', '/api/api.test');
    return request(options);
}

slack.prototype.post_message = function (channel, text, as_user, icon_url, username) {
    let payload = {
        channel,
        text,
        as_user,
        icon_url,
        username
    };
    let options = this.request_option('POST', '/api/chat.postMessage', payload);
    return request(options);
}

slack.prototype.delete_message = function (channel, ts, as_user) {
    let payload = {
        channel,
        ts,
        as_user
    }
    let options = this.request_option('POST', '/api/chat.delete', payload);
    return request(options);
}

function today_message(message_array) {
    Date.prototype.getDOY = function () {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((this - onejan) / 86400000);
    };
    const today = new Date();
    const daynum = today.getDOY();
    return message_array[daynum % message_array.length];
}

function request(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(res.statusCode);
                console.log(data);
                if (res.statusCode === 200) {
                    let json = JSON.parse(data);
                    if (json.ok)
                        resolve(json);
                    else
                        reject(data);
                } else {
                    reject(data);
                }
            });
        });

        req.on('error', (err) => {
            console.log(`error: ${err}`);
        });
        req.end();
    });
}

function delay(value, ms = 3000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}

exports.test = async (event) => {
    return new Promise((resolve, reject) => {
        SLACK.test()
            .then(() => {
                const username = event.username || 'bot';
                const icon_url = event.icon_url || false;
                const as_user = event.as_user || true;

                const channel = event.channel || '';
                const message = event.message || today_message(message_data);
                const atHere = event.atHere || false;
                const atSomeone = event.atSomeone || false;
                const emoji = event.emoji || ' :ningning:';
                let text = SLACK.message(atHere, atSomeone, message) + emoji;
                return SLACK.post_message(channel, text, as_user, icon_url, username)
            })
            .then((data) => {
                return delay(data, 5000)
            })
            .then((data) => {
                const as_user = event.as_user || true;
                return SLACK.delete_message(data.channel, data.ts, as_user)
            })
            .then(() => {
                resolve('Done');
            })
            .catch((err) => {
                reject(err)
            })
    });
};

exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        SLACK.test()
            .then(() => {
                const username = event.username || 'bot';
                const icon_url = event.icon_url || false;
                const as_user = event.as_user || true;

                const channel = event.channel || '';
                const message = event.message || today_message(message_data);
                const atHere = event.atHere || false;
                const atSomeone = event.atSomeone || false;
                const emoji = event.emoji || ' :ningning:';
                let text = SLACK.message(atHere, atSomeone, message) + emoji;
                return SLACK.post_message(channel, text, as_user, icon_url, username)
            })
            .then(() => {
                resolve('Done');
            })
            .catch((err) => {
                reject(err)
            })
    });
};
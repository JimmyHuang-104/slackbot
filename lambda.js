'use strict';
const https = require('https');
const querystring = require('querystring');
const message_data = require('./data.json');

const HOSTNAME = 'slack.com';
const TOKEN = process.env.slack_token || '';

function slack(method, path) {
    this.method = method;
    this.path = path;
}

slack.prototype.request_option = function (payload) {
    if (payload && typeof payload == 'object') {
        payload.token = TOKEN
    }
    return {
        hostname: HOSTNAME,
        path: payload ? this.path + '?' + querystring.stringify(payload) : this.path,
        method: this.method,
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
        let test = new slack('POST', '/api/api.test');
        let test_options = test.request_option();
        request(test_options)
            .then(() => {
                const username = event.slack_username || 'bot';
                const icon_url = event.slack_icon_url || false;
                const as_user = event.slack_as_user || true;

                const channel = event.slack_channel || '';
                const message = event.slack_message || today_message(message_data);
                const atHere = event.slack_atHere || false;
                const atSomeone = event.slack_atSomeone || false;
                const emoji = event.slack_emoji || ' :ningning:';

                let post = new slack('POST', '/api/chat.postMessage')
                let text = post.message(atHere, atSomeone, message) + emoji;
                let post_options = post.request_option({
                    channel,
                    text,
                    as_user,
                    icon_url,
                    username
                })
                return request(post_options);
            })
            .then((data) => {
                const delete_payload = {
                    channel: data.channel,
                    ts: data.ts,
                    as_user: event.slack_as_user
                };
                let del = new slack('POST', '/api/chat.delete')
                let delete_options = del.request_option(delete_payload)
                return delay(delete_options, 5000)
            })
            .then((delete_options) => {
                return request(delete_options);
            })
            .then(() => {
                resolve('Done')
            })
            .catch((err) => {
                reject(err)
            })
    });
};

exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        let test = new slack('POST', '/api/api.test');
        let test_options = test.request_option();
        request(test_options)
            .then(() => {
                const username = event.slack_username || 'bot';
                const icon_url = event.slack_icon_url || false;
                const as_user = event.slack_as_user || true;

                const channel = event.slack_channel || '';
                const message = event.slack_message || today_message(message_data);
                const atHere = event.slack_atHere || false;
                const atSomeone = event.slack_atSomeone || false;
                const emoji = event.slack_emoji || ' :ningning:';

                let post = new slack('POST', '/api/chat.postMessage')
                let text = post.message(atHere, atSomeone, message) + emoji;
                let post_options = post.request_option({
                    channel,
                    text,
                    as_user,
                    icon_url,
                    username
                })
                return request(post_options);
            })
            .then(() => {
                resolve('Done')
            })
            .catch((err) => {
                reject(err)
            })
    });
};
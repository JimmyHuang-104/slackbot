const https = require('https');
const querystring = require('querystring');

const token = process.env.slack_token || '';
const channel = process.env.slack_channel || '';
const message = process.env.slack_message || '';
const atHere = process.env.slack_atHere || false;
const as_user = process.env.slack_as_user || true;

const hostname = 'slack.com'

const post_payload = {
    channel,
    text: atHere ? `@here ${message}` : message,
    as_user,
    parse: 'full'
};

const test_options = slack_options('POST', '/api/api.test')
const post_options = slack_options('POST', '/api/chat.postMessage', post_payload)

function slack_options(method, path, payload) {
    if (payload)
        payload.token = token;
    return {
        hostname,
        path: payload ? path + '?' + querystring.stringify(payload) : path,
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    }
}

function slack(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(res.statusCode);
                console.log(data)
                if (res.statusCode === 200) {
                    let json = JSON.parse(data)
                    if (json.ok)
                        resolve(json)
                    else
                        reject(data)
                } else {
                    reject(data)
                }
            });
        });

        req.on('error', (err) => {
            console.log(`error: ${err}`);
        });
        req.end();
    })
}

slack(test_options)
    .then(() => {
        return slack(post_options)
    })
    .then((data) => {
        const delete_payload = {
            channel: data.channel,
            ts: data.ts,
            as_user
        };
        const delete_options = slack_options('POST', '/api/chat.delete', delete_payload)
        return setTimeout(() => { slack(delete_options) }, 3000)
    })
    .then(() => {
        console.log('Done')
    })
    .catch((err) => {
        console.log(err)
    })
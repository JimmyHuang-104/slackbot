const https = require('https');

const token = process.env.slack_token || 'xoxb-6243340439-387842576404-KH6ZzT9gJFcEmj7cSO4NVmY6';
const atHere = process.env.slack_atHere || false;
const message = process.env.slack_message || '好像沒什麼話好說 :cry2:';
const channel = process.env.slack_channel || 'GEC54RHHN';

const payload = {
    token,
    channel,
    text: atHere ? `@here ${message}` : message,
    link_names: true,
    // icon_emoji: ':innocent:',
    // username: 'wtest'
};

const query = Object.keys(payload).map((k) => {
    return `${encodeURIComponent(k)}=${encodeURIComponent(payload[k])}`
}).join('&');

const options = {
    hostname: 'slack.com',
    path: `/api/chat.postMessage?${query}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(res.statusCode);
    });
});

req.write('');
req.on('error', (err) => {
    console.log(`error: ${err}`);
});
req.end();
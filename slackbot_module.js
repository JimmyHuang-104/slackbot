const Slack = require('slack');
const token = process.env.slack_token || '';
const channel = process.env.slack_channel || '';
const message = process.env.slack_message || '';
const atHere = process.env.slack_atHere || false;
const as_user = process.env.slack_as_user || true;
const bot = new Slack({ token });

const postMessage = {
    channel,
    text: atHere ? `@here ${message}` : message,
    as_user,
    parse: 'full'
};

bot.chat.postMessage(postMessage).then((rep) => {
    console.log(rep);
    if (rep.ok) {
        setTimeout(() => { bot.chat.delete({ channel: rep.channel, ts: rep.ts }) }, 3000);
    }
});

console.log("кира заработала");
process.title = "betbotKira";
process.on('uncaughtException', function(error) {
    log.add('Упс, произошла непредвиденная ошибка: '+error.stack);
    console.error(error.stack);
    return false;
});

const mongoClient = require("mongodb").MongoClient;
let dbase;
mongoClient.connect("mongodb://localhost:27017/betbot", function(err, db){
    if(err){
        return console.log(err);
    }
    dbase = db;
    // db.close();
});

const TelegramBot = require('node-telegram-bot-api');
let tg;
let callback = {};
function createBot() {
    const token = "407510348:AAF03V8XGfRQgmxdqa16sriFr9R7m2lEcP0";
    tg = new TelegramBot(token, {
        polling: true
    });
    tg.on('message', onMessage);
    tg.on('callback_query', onCallbackQuery);
}
function onMessage(message) {
    console.log(message.from.username + ': ' + message.text);
    if (message.text && message.text.toLowerCase() === '/start') {
        tg.sendMessage(message.chat.id, "Привет, " + message.chat.first_name + "! Меня зовут Кира и я буду помогать тебе со ставками! " +
            "Просто отправь мне \"\/menu\"");
    }
    if (message.text && message.text.toLowerCase() === '/menu') {
         sendMenuMessage(message);
    }
    // console.log('callback: ' + callback);
    if (message.text && callback[message.chat.id]){
        if (callback[message.chat.id] === 'activationCmd'){
            dbase.collection("users").find({name: 'foule'}).toArray(function(err, results) {
                console.log(results);
                // console.log(message);
            });
            tg.sendMessage(message.chat.id, 'попал в активацию');
            console.log('попал в активацию');
            delete callback.id;
        }
        if (callback[message.chat.id] === 'statusCmd'){
            tg.sendMessage(message.chat.id, 'попал в статус');
            console.log('попал в статус');
            delete callback.id;
        }
    }
}
function onCallbackQuery(callbackQuery) {
    if (callbackQuery.data === 'activationCmd') {
        let activationText = "Введите ключ";
        tg.sendMessage(callbackQuery.message.chat.id, activationText);
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'statusCmd') {
        let statusText = "Проверка статуса подписки";
        tg.sendMessage(callbackQuery.message.chat.id, statusText);
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'instructionCmd') {
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'faqCmd') {
        tg.answerCallbackQuery(callbackQuery.id);
    }
    // console.log(callbackQuery);
    let id = callbackQuery.message.chat.id;
    callback[id] = callbackQuery.data;
}
function sendMenuMessage(message) {
    const text = 'Выбери, что тебе нужно';
    const activationButton = {
        text:"Активировать ключ",
        callback_data:'activationCmd'
    };
    const statusButton = {
        text:"Статус подписки",
        callback_data:'statusCmd'
    };
    const instructionButton = {
        text:"Инструкция",
        callback_data:'instructionCmd',
        url: 'http://telegra.ph/Kak-pravilno-polzovatsya-Kiroj-10-21'
    };
    const faqButton = {
        text:"F.A.Q.",
        callback_data:'faqCmd',
        url: 'http://telegra.ph/FAQ-10-21'
    };
    const options = {};
    options.reply_markup = {};
    options.reply_markup.inline_keyboard = [];
    options.reply_markup.inline_keyboard.push([activationButton, statusButton]);
    options.reply_markup.inline_keyboard.push([instructionButton, faqButton]);
    tg.sendMessage(message.chat.id, text, options);
}
createBot();
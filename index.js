console.log("кира заработала");
process.title = "betbotKira";
process.on('uncaughtException', function(error) {
    log.add('Упс, произошла непредвиденная ошибка: '+error.stack);
    console.error(error.stack);
    return false;
});

var mongoClient = require("mongodb").MongoClient;
var dbase;
mongoClient.connect("mongodb://localhost:27017/betbot", function(err, db){
    if(err){
        return console.log(err);
    }
    dbase = db;
    // db.close();
});

var TelegramBot = require('node-telegram-bot-api');
var tg;
var callback = [];
function createBot() {
    var token = "407510348:AAF03V8XGfRQgmxdqa16sriFr9R7m2lEcP0";
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
    console.log('callback: ' + callback);
    if (message.text && callback.length > 0){
        for(var i=0; i < callback.length; i++) {
            if (callback[i].from.id === message.from.id){
                if (callback[i].data === 'activationCmd'){
                    dbase.collection("users").find({name: 'foule'}).toArray(function(err, results) {
                        console.log(results);
                        // console.log(message);
                    });
                    tg.sendMessage(message.chat.id, 'попал в активацию');
                    console.log('попал в активацию');
                    callback.splice(i, 1);
                    break;
                }
                if (callback[i].data === 'statusCmd'){
                    tg.sendMessage(message.chat.id, 'попал в статус');
                    console.log('попал в статус');
                    callback.splice(i, 1);
                    break;
                }
            }
        }
    }
}
function onCallbackQuery(callbackQuery) {
    if (callbackQuery.data === 'activationCmd') {
        var activationText = "Введите ключ";
        tg.sendMessage(callbackQuery.message.chat.id, activationText);
        tg.answerCallbackQuery(callbackQuery.id);
        callback.unshift(callbackQuery);
    } else if (callbackQuery.data === 'statusCmd') {
        var statusText = "Проверка статуса подписки";
        tg.sendMessage(callbackQuery.message.chat.id, statusText);
        tg.answerCallbackQuery(callbackQuery.id);
        callback.unshift(callbackQuery);
    } else if (callbackQuery.data === 'instructionCmd') {
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'faqCmd') {
        tg.answerCallbackQuery(callbackQuery.id);
    }
}
function sendMenuMessage(message) {
    var text = 'Выбери, что тебе нужно';
    var activationButton = {
        text:"Активировать ключ",
        callback_data:'activationCmd'
    };
    var statusButton = {
        text:"Статус подписки",
        callback_data:'statusCmd'
    };
    var instructionButton = {
        text:"Инструкция",
        callback_data:'instructionCmd',
        url: 'http://telegra.ph/Kak-pravilno-polzovatsya-Kiroj-10-21'
    };
    var faqButton = {
        text:"F.A.Q.",
        callback_data:'faqCmd',
        url: 'http://telegra.ph/FAQ-10-21'
    };
    var options = {};
    options.reply_markup = {};
    options.reply_markup.inline_keyboard = [];
    options.reply_markup.inline_keyboard.push([activationButton, statusButton]);
    options.reply_markup.inline_keyboard.push([instructionButton, faqButton]);
    tg.sendMessage(message.chat.id, text, options);
}
createBot();
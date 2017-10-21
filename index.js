console.log("кира заработала");
process.title = "betbotKira";
process.on('uncaughtException', function(error) {
    log.add('Упс, произошла непредвиденная ошибка: '+error.stack);
    console.error(error.stack);
    return false;
});
var TelegramBot = require('node-telegram-bot-api');
var tg;
function create() {
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
}
function onCallbackQuery(callbackQuery) {
    if (callbackQuery.data === 'activationCmd') {
        // console.log(callbackQuery);
        var activationText = "Введите ключ";
        tg.sendMessage(callbackQuery.message.chat.id, activationText);
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'statusCmd') {
        var statusText = "Проверка статуса подписки";
        tg.sendMessage(callbackQuery.message.chat.id, statusText);
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'instructionCmd') {
        var instructionText = "Инструкция";
        tg.sendMessage(callbackQuery.message.chat.id, instructionText);
        tg.answerCallbackQuery(callbackQuery.id);
    } else if (callbackQuery.data === 'faqCmd') {
        var faqText = "Здесь будут ответы на некоторые вопросы";
        tg.sendMessage(callbackQuery.message.chat.id, faqText);
        tg.answerCallbackQuery(callbackQuery.id);
    }
}
// *********************************************
function sendMenuMessage(message) {
    var text = 'Выбери, что тебе нужно';
    //
    var activationButton = {
        text:"Активировать ключ",
        callback_data:'activationCmd'
    };
    //
    var statusButton = {
        text:"Статус подписки",
        callback_data:'statusCmd'
    };
    var instructionButton = {
        text:"Инструкция",
        callback_data:'instructionCmd'
    };
    var faqButton = {
        text:"F.A.Q.",
        callback_data:'faqCmd'
    };
    //
    var options = {};
    options.reply_markup = {};
    options.reply_markup.inline_keyboard = [];
    options.reply_markup.inline_keyboard.push([activationButton, statusButton]);
    options.reply_markup.inline_keyboard.push([instructionButton, faqButton]);
    tg.sendMessage(message.chat.id, text, options);
}
create();
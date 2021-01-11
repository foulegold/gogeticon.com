const mongoClient = require("mongodb").MongoClient;
mongoClient.connect("mongodb://localhost:27017/betbot", function(err, db){
    if(err){
        return console.log(err);
    }
    console.log("кира заработала");
    const TelegramBot = require('node-telegram-bot-api');
    let tg;
    function createBot() {
        const token = "407510348:AAF03V8XGfRQgmxasdasdasddqa16sriFr9R7m2lEcP0";
        tg = new TelegramBot(token, {
            polling: true
        });
        tg.on('message', onMessage);
        tg.on('callback_query', onCallbackQuery);
    }
    let callback = {};
    function onMessage(message) {
        console.log(message.from.username + ': ' + message.text);
        if (message.text && message.text.toLowerCase() === '/start') {
            tg.sendMessage(message.chat.id, "Привет, " + message.chat.first_name + "! Меня зовут Кира и я буду помогать тебе со ставками! " +
                "Просто отправь мне \"\/menu\"");
        }
        if (message.text && message.text.toLowerCase() === '/menu') {
            sendMenuMessage(message);
        }
        // активация ключа
        if (message.text && callback[message.chat.id] && callback[message.chat.id] === 'activationCmd'){
            db.collection("users").findOne({key : message.text}, function(err, results) {
                console.log(results);
                if (results){
                    let tl;
                    if (results.month){
                        tl = 730 * results.month;
                    }
                    else {
                        tl = 730
                    }
                    if (results.timeleft) {
                        if (results.timeleft > 0) {
                            db.collection("users").findOneAndUpdate({chatid: message.chat.id}, {$set: {timeleft: results.timeleft + tl}}
                                , function (err, results) {
                                    tg.sendMessage(message.chat.id, 'Ваш ключ успешно обновлен!');
                                });
                            db.collection("users").findOneAndUpdate({chatid: message.chat.id}, {$unset: {key: message.text}}, function (err, results){
                                console.log('ключ удален');
                            });
                        } else {
                            db.collection("users").findOneAndUpdate({chatid: message.chat.id}, {$set: {timeleft: tl}}
                                , function (err, results) {
                                    tg.sendMessage(message.chat.id, 'Ваш ключ успешно активирован! Скоро вам придет первый прогноз!');
                                });
                            db.collection("users").findOneAndUpdate({chatid: message.chat.id}, {$unset: {key: message.text}}, function (err, results) {
                                console.log('ключ удален');
                            });
                        }
                    }else{
                        db.collection("users").findOneAndUpdate({key: message.text}, {$set: {chatid: message.chat.id, timeleft: tl}}
                            , function (err, results) {
                                tg.sendMessage(message.chat.id, 'Ваш ключ успешно активирован! Скоро вам придет первый прогноз!');
                            });
                        db.collection("users").findOneAndUpdate({key: message.text}, {$unset: {key: message.text}}, function (err, results) {
                            console.log('ключ удален');
                        });
                    }
                }else{
                    tg.sendMessage(message.chat.id, 'Ключ не обнаружен!');
                }
            });
            delete callback[message.chat.id];
        }
        // заполнение нового юзера
        if (message.text && callback[message.chat.id] === 'newkeyCmd') {
            db.collection("users").findOneAndUpdate({name: callback.name}, {$set: {key: message.text}}, function(err, results){
                if (results) {
                    console.log(results);
                    tg.sendMessage(message.chat.id, 'Ключ сохранен');
                }else {
                    tg.sendMessage(message.chat.id, 'Пользователь не найден, попробуйте снова.');
                }
            });
            delete callback[message.chat.id];
            delete callback.name;
        }
        if (message.text && callback[message.chat.id] === 'newuserCmd') {
            db.collection("users").findOne({name : message.text}, function(err, results) {
                if (results){
                    tg.sendMessage(message.chat.id, 'Такое имя уже есть в базе!');
                } else {
                    db.collection("users").insertOne({name: message.text}, function(err, results){
                        tg.sendMessage(message.chat.id, 'Имя добавлено. Введите ключ:');
                    });
                }
            });
            callback[message.chat.id] = 'newkeyCmd';
            callback.name = message.text;
        }
    }
    function onCallbackQuery(callbackQuery) {
        switch (callbackQuery.data){
            case 'activationCmd' :
                let activationText = "Введите ключ";
                tg.sendMessage(callbackQuery.message.chat.id, activationText);
                tg.answerCallbackQuery(callbackQuery.id);
                break;
            case 'statusCmd' :
                statuscheck(callbackQuery.message.chat.id);
                tg.answerCallbackQuery(callbackQuery.id);
                break;
            case 'instructionCmd' :
                tg.answerCallbackQuery(callbackQuery.id);
                break;
            case 'faqCmd' :
                tg.answerCallbackQuery(callbackQuery.id);
                break;
            case 'vkCmd' :
                tg.answerCallbackQuery(callbackQuery.id);
                break;
            case 'newuserCmd' :
                tg.sendMessage(callbackQuery.message.chat.id, 'Введите имя:');
                tg.answerCallbackQuery(callbackQuery.id);
                break;
        }
        let id = callbackQuery.message.chat.id;
        callback[id] = callbackQuery.data;
    }
    // основное меню
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
        const vkButton = {
            text:"Группа ВК",
            callback_data:'vkCmd',
            url: 'https://vk.com/betbotcapper'
        };
        const newuserButton = {
            text:"Новый юзер",
            callback_data:'newuserCmd',
        };
        let options;
        if (message.chat.id === 347860214 || message.chat.id === 264251601){
            options = {
                reply_markup: {
                    inline_keyboard: [
                        [activationButton, statusButton],
                        [instructionButton, faqButton, vkButton],
                        [newuserButton]
                    ]
                }
            };
        }else {
            options = {
                reply_markup: {
                    inline_keyboard: [
                        [activationButton, statusButton],
                        [instructionButton, faqButton, vkButton]
                    ]
                }
            };
        }
        tg.sendMessage(message.chat.id, text, options);
    }
    // проверка статуса подписки
    function statuscheck(chatid) {
        // let a = 12;
        // db.collection("users").findOneAndUpdate({name: 'seclace'}, {$set: {month: a, timeleft: 0, key: "22222"}}, function(err, result){
        //     console.log(result)});
        db.collection("users").findOne({chatid: chatid}, function(err, results) {
            if (results) {
                let days, hours;
                if (results.timeleft > 24) {
                    days = Math.floor(results.timeleft/24);
                    hours = results.timeleft%24;
                    tg.sendMessage(chatid, 'Осталось ' + days + 'd ' + hours + 'h.');
                }else {
                    tg.sendMessage(chatid, 'Осталось ' + results.timeleft + 'h.');
                }
            }else{
                tg.sendMessage('Вы еще не активировали Киру.');
            }
        });
    }
    createBot();
});

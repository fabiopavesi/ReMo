"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TelegramBotApi = require("node-telegram-bot-api");
var configuration_1 = require("./model/configuration");
var token;
var chatId;
var TelegramBot = /** @class */ (function () {
    function TelegramBot() {
        var _this = this;
        this.ready = false;
        this.token = configuration_1.Configuration.get('telegramToken');
        this.chatId = configuration_1.Configuration.get('telegramChatId');
        try {
            this.bot = new TelegramBotApi(this.token, { polling: false });
            this.ready = true;
            this.bot.onText(/\/start/, function (msg) {
                _this.bot.sendMessage(msg.chat.id, "Welcome to " + msg.chat.id);
            });
        }
        catch (e) {
            console.log('Telegram error', e);
        }
    }
    TelegramBot.prototype.send = function (message) {
        if (this.ready) {
            this.bot.sendMessage(this.chatId, message, { parse_mode: "HTML" });
        }
    };
    return TelegramBot;
}());
exports.TelegramBot = TelegramBot;

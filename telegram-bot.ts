import * as TelegramBotApi from 'node-telegram-bot-api';
import {Configuration} from './model/configuration';

let token;
let chatId;

export class TelegramBot {
    bot;
    token;
    chatId;
    ready = false;

    constructor() {
        this.token = Configuration.get('telegramToken');
        this.chatId = Configuration.get('telegramChatId');
        try {
            this.bot = new TelegramBotApi(this.token, {polling: false});
            this.ready = true;
            this.bot.onText(/\/start/, (msg) => {

                this.bot.sendMessage(msg.chat.id, "Welcome to " + msg.chat.id);

            });
        } catch (e) {
            console.log('Telegram error', e);
        }

    }

    send(message: any) {
        if ( this.ready ) {
            this.bot.sendMessage(this.chatId, message, {parse_mode : "HTML"});
        }
    }
}

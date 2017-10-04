#!/usr/bin/env node

import * as mqtt from 'mqtt';
import * as q from 'q';
import {Configuration, DEFAULT_CONFIG_FILENAME} from './model/configuration';
import {
    AlertMessage, OPS, RegistrationMessage, RequestMessage, RestartResponse,
    StatusUpdateResponse
} from './model/message';
import {ServerEntry, ServerList} from './model/server-list';
import {TelegramBot} from './telegram-bot';

let baseTopic;
var argv = require('optimist').argv;
console.log('arguments', argv);
if ( argv.c ) {
    Configuration.initialize(argv.c)
        .then((res) => {
            baseTopic = Configuration.get('mqttBaseTopic');
            ServerList.initialize();
            const monitor = new Monitor();
            monitor.start();
        })
} else {
    Configuration.initialize(DEFAULT_CONFIG_FILENAME)
        .then((res) => {
            baseTopic = Configuration.get('mqttBaseTopic');
            ServerList.initialize();
            const monitor = new Monitor();
            monitor.start();
        })
}

const get = require('simple-get');

export class Monitor {
    client;
    interval;
    telegramBot: TelegramBot;

    private connectMqtt() {
        let mqttOptions: any = {

        };
        if ( Configuration.get('mqttUser') && Configuration.get('mqttPassword') ) {
            mqttOptions.username = Configuration.get('mqttUser');
            mqttOptions.password = Configuration.get('mqttPassword')
        }
        this.client = mqtt.connect(Configuration.get('mqttUrl'), mqttOptions);
    }

    constructor() {
        this.telegramBot = new TelegramBot();
        this.connectMqtt();
        this.client.on('connect', () => {
            console.log('connected');
            this.client.subscribe(baseTopic + '/#')
            let message = new RequestMessage();
            message.op = OPS.PRESENCE;
            message.senderId = Configuration.get('serverId');
            message.payload = {
                status: 200,
                message: 'I am here'
            };
            this.client.publish(baseTopic, JSON.stringify(message));
        })

        this.client.on('message', (topic, message) => {
            let theMessage;
            try {
                theMessage = JSON.parse(message.toString());
                console.log('received message on', topic.toString(), theMessage);
                switch (topic.toString()) {
                    case baseTopic + '/reception':
                        let registration = <RegistrationMessage> theMessage;
                        // registration.payload.id = registration.payload.id + '@' + registration.senderId;
                        console.log('registration', registration);
                        ServerList.add(registration.payload);
                        break;
                    case baseTopic + '/telegram':
                        let response = <RestartResponse> theMessage;
                        this.telegramBot.send(`<b>Problema sul servizio ${response.payload.id}</b>\n\nSatellite competente: ${response.senderId}\nRisultato del tentativo di restart: ${JSON.stringify(response.errore)}`);
                        break;

                }
            } catch (e) {
                console.log(e);
            }
        });
    }

    check(server: ServerEntry) {
        const deferred = q.defer();
        console.log('checking', server.id);
        get(server.testUrl, (err, res) => {
            if ( err ) {
                let alert = new AlertMessage();
                alert.senderId = Configuration.get('serverId');
                alert.recipientId = server.responsibleSatelliteId;
                alert.serviceId = server.id;
                alert.payload = err;

                this.client.publish(baseTopic + '/alerts/' + server.responsibleSatelliteId, JSON.stringify(alert));
            } else {
                console.log(server.id, 'ok');
                let status = new StatusUpdateResponse();
                status.senderId = Configuration.get('serverId');
                status.op = OPS.STATUS_UPDATE;
                status.status = 200;
                status.payload = server;
                this.client.publish(baseTopic + '/responses', JSON.stringify(status));
                deferred.resolve('ok');
            }
        })
        return deferred.promise;
    }

    checkAll() {
        console.log('checking cycle', ServerList.servers.length);
        let promises = [];
        for ( let s of ServerList.servers ) {
            const promise = this.check(s)
                .then(res => {
                    return q(true);
                })
            promises.push(promise);
        }
        q.all(promises)
            .then( (res) => {
            })
    }

    start() {
        this.checkAll();
        this.interval = setInterval( () => {
            this.checkAll();
        }, 1000 * 60 /* * 30 */);
    }

    stop() {
        if ( this.interval ) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

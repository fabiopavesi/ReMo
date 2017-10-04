#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt = require("mqtt");
var q = require("q");
var configuration_1 = require("./model/configuration");
var message_1 = require("./model/message");
var server_list_1 = require("./model/server-list");
var telegram_bot_1 = require("./telegram-bot");
var baseTopic;
var argv = require('optimist').argv;
console.log('arguments', argv);
if (argv.c) {
    configuration_1.Configuration.initialize(argv.c)
        .then(function (res) {
        baseTopic = configuration_1.Configuration.get('mqttBaseTopic');
        server_list_1.ServerList.initialize();
        var monitor = new Monitor();
        monitor.start();
    });
}
else {
    configuration_1.Configuration.initialize(configuration_1.DEFAULT_CONFIG_FILENAME)
        .then(function (res) {
        baseTopic = configuration_1.Configuration.get('mqttBaseTopic');
        server_list_1.ServerList.initialize();
        var monitor = new Monitor();
        monitor.start();
    });
}
var get = require('simple-get');
var Monitor = (function () {
    function Monitor() {
        var _this = this;
        this.telegramBot = new telegram_bot_1.TelegramBot();
        this.connectMqtt();
        this.client.on('connect', function () {
            console.log('connected');
            _this.client.subscribe(baseTopic + '/#');
            var message = new message_1.RequestMessage();
            message.op = message_1.OPS.PRESENCE;
            message.senderId = configuration_1.Configuration.get('serverId');
            message.payload = {
                status: 200,
                message: 'I am here'
            };
            _this.client.publish(baseTopic, JSON.stringify(message));
        });
        this.client.on('message', function (topic, message) {
            var theMessage;
            try {
                theMessage = JSON.parse(message.toString());
                console.log('received message on', topic.toString(), theMessage);
                switch (topic.toString()) {
                    case baseTopic + '/reception':
                        var registration = theMessage;
                        // registration.payload.id = registration.payload.id + '@' + registration.senderId;
                        console.log('registration', registration);
                        server_list_1.ServerList.add(registration.payload);
                        break;
                    case baseTopic + '/telegram':
                        var response = theMessage;
                        _this.telegramBot.send("<b>Problema sul servizio " + response.payload.id + "</b>\n\nSatellite competente: " + response.senderId + "\nRisultato del tentativo di restart: " + JSON.stringify(response.errore));
                        break;
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    Monitor.prototype.connectMqtt = function () {
        var mqttOptions = {};
        if (configuration_1.Configuration.get('mqttUser') && configuration_1.Configuration.get('mqttPassword')) {
            mqttOptions.username = configuration_1.Configuration.get('mqttUser');
            mqttOptions.password = configuration_1.Configuration.get('mqttPassword');
        }
        this.client = mqtt.connect(configuration_1.Configuration.get('mqttUrl'), mqttOptions);
    };
    Monitor.prototype.check = function (server) {
        var _this = this;
        var deferred = q.defer();
        console.log('checking', server.id);
        get(server.testUrl, function (err, res) {
            if (err) {
                var alert_1 = new message_1.AlertMessage();
                alert_1.senderId = configuration_1.Configuration.get('serverId');
                alert_1.recipientId = server.responsibleSatelliteId;
                alert_1.serviceId = server.id;
                alert_1.payload = err;
                _this.client.publish(baseTopic + '/alerts/' + server.responsibleSatelliteId, JSON.stringify(alert_1));
            }
            else {
                console.log(server.id, 'ok');
                var status_1 = new message_1.StatusUpdateResponse();
                status_1.senderId = configuration_1.Configuration.get('serverId');
                status_1.op = message_1.OPS.STATUS_UPDATE;
                status_1.status = 200;
                status_1.payload = server;
                _this.client.publish(baseTopic + '/responses', JSON.stringify(status_1));
                deferred.resolve('ok');
            }
        });
        return deferred.promise;
    };
    Monitor.prototype.checkAll = function () {
        console.log('checking cycle', server_list_1.ServerList.servers.length);
        var promises = [];
        for (var _i = 0, _a = server_list_1.ServerList.servers; _i < _a.length; _i++) {
            var s = _a[_i];
            var promise = this.check(s)
                .then(function (res) {
                return q(true);
            });
            promises.push(promise);
        }
        q.all(promises)
            .then(function (res) {
        });
    };
    Monitor.prototype.start = function () {
        var _this = this;
        this.checkAll();
        this.interval = setInterval(function () {
            _this.checkAll();
        }, 1000 * 60 /* * 30 */);
    };
    Monitor.prototype.stop = function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    };
    return Monitor;
}());
exports.Monitor = Monitor;

#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./model/configuration");
var baseTopic;
var SERVICE_LIST_PATH;
var argv = require('optimist').argv;
console.log('arguments', argv);
if (argv.c) {
    configuration_1.Configuration.initialize(argv.c)
        .then(function (res) {
        baseTopic = configuration_1.Configuration.get('mqttBaseTopic');
        SERVICE_LIST_PATH = configuration_1.Configuration.get('serviceListPath');
        server_list_1.ServerList.initialize();
        var monitoree = new SatelliteMonitor();
    });
}
else {
    configuration_1.Configuration.initialize(configuration_1.DEFAULT_CONFIG_FILENAME)
        .then(function (res) {
        baseTopic = configuration_1.Configuration.get('mqttBaseTopic');
        SERVICE_LIST_PATH = configuration_1.Configuration.get('serviceListPath');
        server_list_1.ServerList.initialize();
        var monitoree = new SatelliteMonitor();
    });
}
var mqtt = require("mqtt");
var fs = require("fs");
var message_1 = require("./model/message");
var server_list_1 = require("./model/server-list");
var exec = require('child_process').exec;
var SatelliteMonitor = (function () {
    function SatelliteMonitor() {
        var _this = this;
        this.services = [];
        this.readServers();
        this.connectMqtt();
        this.client.on('connect', function () {
            console.log('connected');
            _this.client.subscribe(baseTopic + '/alerts/' + configuration_1.Configuration.get('clientId'));
            for (var _i = 0, _a = _this.services; _i < _a.length; _i++) {
                var s = _a[_i];
                var message = new message_1.RegistrationMessage();
                message.senderId = configuration_1.Configuration.get('clientId');
                message.payload = new server_list_1.ServerEntry();
                message.payload.id = s.id;
                message.payload.responsibleSatelliteId = message.senderId;
                message.payload.testUrl = s.url;
                message.payload.interval = s.interval;
                _this.client.publish(baseTopic + '/reception', JSON.stringify(message));
            }
        });
        this.client.on('message', function (topic, message) {
            var theMessage = JSON.parse(message.toString());
            //            console.log('received message on', topic.toString(), theMessage);
            switch (topic.toString()) {
                case baseTopic + '/reception':
                    break;
                case baseTopic + '/alerts/' + configuration_1.Configuration.get('clientId'):
                    var alert_1 = theMessage;
                    var service_1 = _this.findService(alert_1.serviceId);
                    exec(service_1.restartCommand, function (err, stdout, stderr) {
                        if (err) {
                            var response = new message_1.RestartResponse();
                            response.senderId = configuration_1.Configuration.get('clientId');
                            response.status = 500;
                            response.payload = service_1;
                            response.errore = err;
                            _this.client.publish(baseTopic + '/telegram', JSON.stringify(response));
                            console.log(baseTopic + '/telegram', JSON.stringify(response));
                        }
                    });
                    break;
            }
        });
    }
    SatelliteMonitor.prototype.connectMqtt = function () {
        var mqttOptions = {};
        if (configuration_1.Configuration.get('mqttUser') && configuration_1.Configuration.get('mqttPassword')) {
            mqttOptions.username = configuration_1.Configuration.get('mqttUser');
            mqttOptions.password = configuration_1.Configuration.get('mqttPassword');
        }
        this.client = mqtt.connect(configuration_1.Configuration.get('mqttUrl'), mqttOptions);
    };
    SatelliteMonitor.prototype.readServers = function () {
        try {
            var temp = fs.readFileSync(SERVICE_LIST_PATH, 'utf8');
            temp = JSON.parse(temp);
            this.services = temp;
        }
        catch (e) {
            console.log('error reading', SERVICE_LIST_PATH, e);
            fs.writeFileSync(SERVICE_LIST_PATH, "[]", 'utf8');
        }
    };
    SatelliteMonitor.prototype.findService = function (id) {
        for (var _i = 0, _a = this.services; _i < _a.length; _i++) {
            var s = _a[_i];
            if (s.id === id) {
                return s;
            }
        }
    };
    return SatelliteMonitor;
}());
exports.SatelliteMonitor = SatelliteMonitor;

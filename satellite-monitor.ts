#!/usr/bin/env node

import {Configuration, DEFAULT_CONFIG_FILENAME} from './model/configuration';

let baseTopic;
let SERVICE_LIST_PATH;

var argv = require('optimist').argv;
console.log('arguments', argv);
if ( argv.c ) {
    Configuration.initialize(argv.c)
        .then((res) => {
            baseTopic = Configuration.get('mqttBaseTopic');
            SERVICE_LIST_PATH = Configuration.get('serviceListPath');
            ServerList.initialize();
            const monitoree = new SatelliteMonitor();
        })
} else {
    Configuration.initialize(DEFAULT_CONFIG_FILENAME)
        .then((res) => {
            baseTopic = Configuration.get('mqttBaseTopic');
            SERVICE_LIST_PATH = Configuration.get('serviceListPath');
            ServerList.initialize();
            const monitoree = new SatelliteMonitor();
        })
}

import * as mqtt from 'mqtt';
import * as fs from 'fs';
import {AlertMessage, OPS, RegistrationMessage, RequestMessage, RestartResponse} from './model/message';
import {ServerEntry, ServerList} from './model/server-list';
import {ServiceEntry} from './model/service-entry';

const { exec } = require('child_process');

export class SatelliteMonitor {
    client;
    services: ServiceEntry[] = [];

    constructor() {
        this.readServers();
        this.connectMqtt();
        this.client.on('connect', () => {
            console.log('connected');
            this.client.subscribe(baseTopic + '/alerts/' + Configuration.get('clientId'))
            for ( let s of this.services ) {
                let message = new RegistrationMessage();
                message.senderId = Configuration.get('clientId');
                message.payload = new ServerEntry();
                message.payload.id = s.id;
                message.payload.responsibleSatelliteId = message.senderId;
                message.payload.testUrl = s.url;
                message.payload.interval = s.interval;
                this.client.publish(baseTopic + '/reception', JSON.stringify(message));
            }
        })

        this.client.on('message', (topic, message) => {
            const theMessage = JSON.parse(message.toString());
//            console.log('received message on', topic.toString(), theMessage);
            switch (topic.toString()) {
                case baseTopic + '/reception':
                    break;
                case baseTopic + '/alerts/' + Configuration.get('clientId'):
                    let alert = <AlertMessage> theMessage;
                    let service = this.findService(alert.serviceId);
                    exec(service.restartCommand, (err, stdout, stderr) => {
                        if ( err ) {
                            let response = new RestartResponse();
                            response.senderId = Configuration.get('clientId');
                            response.status = 500;
                            response.payload = service;
                            response.errore = err;
                            this.client.publish(baseTopic + '/telegram', JSON.stringify(response));
                            console.log(baseTopic + '/telegram', JSON.stringify(response));
                        }
                    });
                    break;
            }
        });
    }

    private connectMqtt() {
        let mqttOptions: any = {

        };
        if ( Configuration.get('mqttUser') && Configuration.get('mqttPassword') ) {
            mqttOptions.username = Configuration.get('mqttUser');
            mqttOptions.password = Configuration.get('mqttPassword')
        }
        this.client = mqtt.connect(Configuration.get('mqttUrl'), mqttOptions);
    }

    readServers() {
        try {
            let temp: any = fs.readFileSync(SERVICE_LIST_PATH, 'utf8');
            temp = JSON.parse(temp);
            this.services = temp;
        } catch (e) {
            console.log('error reading', SERVICE_LIST_PATH, e);
            fs.writeFileSync(SERVICE_LIST_PATH, "[]", 'utf8');
        }
    }

    private findService(id: string): ServiceEntry {
        for ( let s of this.services ) {
            if ( s.id === id ) {
                return s;
            }
        }
    }

}

import * as fs from 'fs';
import * as q from 'q';
import * as chalk from 'chalk';
import * as mkdirp from 'mkdirp';

export const DEFAULT_CONFIG_DIR = '/etc/remo';
export const DEFAULT_CONFIG_FILENAME = DEFAULT_CONFIG_DIR + '/monitor-config.json';

export class Configuration {
    static configuration: any;
    static defaultConfiguration = {
        clientId: "client",
        serverId: "server",
        serverListPath: DEFAULT_CONFIG_DIR + "/server-list.json",
        serviceListPath: DEFAULT_CONFIG_DIR + "/service-list.json",
        telegramToken: "<your token here>",
        telegramChatId: -1,
        mqttUrl: "mqtt://test.mosquitto.org:1883",
/*
        mqttUser: "",
        mqttPassword: "",
*/
        mqttBaseTopic: "server-monitor"
    };
    static initialize(filename: string) {
        const deferred = q.defer();
        let actualFilename = filename;
        console.log('trying to initialise from', filename);
        fs.exists(filename, exists => {
            if ( exists ) {
                Configuration.configuration = JSON.parse(fs.readFileSync(actualFilename, 'utf8'));
                // console.log('configuration', Configuration.configuration)
                console.log('Using configuration from', actualFilename);
                deferred.resolve(actualFilename);
            } else {
                console.log(chalk.bold.hex('#ff3300')('WARNING: Configuration file ', actualFilename, ' not found'));
                actualFilename = DEFAULT_CONFIG_FILENAME;
                mkdirp(DEFAULT_CONFIG_DIR, (err) => {
                    fs.exists(actualFilename, exists => {
                        if ( exists ) {
                            console.log(chalk.bold.hex('#00ff00')('Default configuration file', actualFilename, 'found'));
                            Configuration.configuration = JSON.parse(fs.readFileSync(actualFilename, 'utf8'));
                        } else {
                            console.log('Default configuration file', actualFilename, 'not found... creating it');
                            Configuration.configuration = Configuration.defaultConfiguration;
                            fs.writeFileSync(actualFilename, JSON.stringify(Configuration.configuration), 'utf8');
                        }
                        console.log('Using configuration from', actualFilename);
                        deferred.resolve(actualFilename);
                    });
                })
            }
        })
        return deferred.promise;
    }

    static get(parameter: string) {
        return Configuration.configuration[parameter];
    }
}


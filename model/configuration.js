"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var q = require("q");
var chalk = require("chalk");
var mkdirp = require("mkdirp");
exports.DEFAULT_CONFIG_DIR = '/etc/remo';
exports.DEFAULT_CONFIG_FILENAME = exports.DEFAULT_CONFIG_DIR + '/monitor-config.json';
var Configuration = (function () {
    function Configuration() {
    }
    Configuration.initialize = function (filename) {
        var deferred = q.defer();
        var actualFilename = filename;
        console.log('trying to initialise from', filename);
        fs.exists(filename, function (exists) {
            if (exists) {
                Configuration.configuration = JSON.parse(fs.readFileSync(actualFilename, 'utf8'));
                // console.log('configuration', Configuration.configuration)
                console.log('Using configuration from', actualFilename);
                deferred.resolve(actualFilename);
            }
            else {
                console.log(chalk.bold.hex('#ff3300')('WARNING: Configuration file ', actualFilename, ' not found'));
                actualFilename = exports.DEFAULT_CONFIG_FILENAME;
                mkdirp(exports.DEFAULT_CONFIG_DIR, function (err) {
                    fs.exists(actualFilename, function (exists) {
                        if (exists) {
                            console.log(chalk.bold.hex('#00ff00')('Default configuration file', actualFilename, 'found'));
                            Configuration.configuration = JSON.parse(fs.readFileSync(actualFilename, 'utf8'));
                        }
                        else {
                            console.log('Default configuration file', actualFilename, 'not found... creating it');
                            Configuration.configuration = Configuration.defaultConfiguration;
                            fs.writeFileSync(actualFilename, JSON.stringify(Configuration.configuration), 'utf8');
                        }
                        console.log('Using configuration from', actualFilename);
                        deferred.resolve(actualFilename);
                    });
                });
            }
        });
        return deferred.promise;
    };
    Configuration.get = function (parameter) {
        return Configuration.configuration[parameter];
    };
    Configuration.defaultConfiguration = {
        clientId: "client",
        serverId: "server",
        serverListPath: exports.DEFAULT_CONFIG_DIR + "/server-list.json",
        serviceListPath: exports.DEFAULT_CONFIG_DIR + "/service-list.json",
        telegramToken: "<your token here>",
        telegramChatId: -1,
        mqttUrl: "mqtt://test.mosquitto.org:1883",
        /*
                mqttUser: "",
                mqttPassword: "",
        */
        mqttBaseTopic: "server-monitor"
    };
    return Configuration;
}());
exports.Configuration = Configuration;

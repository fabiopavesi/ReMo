"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var configuration_1 = require("./configuration");
var SERVER_LIST_PATH;
var ServerEntry = (function () {
    function ServerEntry() {
    }
    return ServerEntry;
}());
exports.ServerEntry = ServerEntry;
var ServerList = (function () {
    function ServerList() {
    }
    ServerList.initialize = function () {
        SERVER_LIST_PATH = configuration_1.Configuration.get('serverListPath');
        ServerList.readServers();
    };
    ServerList.readServers = function () {
        try {
            var temp = fs.readFileSync(SERVER_LIST_PATH, 'utf8');
            temp = JSON.parse(temp);
            ServerList.servers = temp;
        }
        catch (e) {
            console.log('error reading', SERVER_LIST_PATH, e);
        }
    };
    ServerList.writeServers = function () {
        fs.writeFileSync(SERVER_LIST_PATH, JSON.stringify(ServerList.servers), 'utf8');
    };
    ServerList.add = function (entry) {
        for (var _i = 0, _a = ServerList.servers; _i < _a.length; _i++) {
            var s = _a[_i];
            if (s.id === entry.id && s.responsibleSatelliteId === entry.responsibleSatelliteId) {
                s.testUrl = entry.testUrl;
                s.interval = entry.interval;
                return;
            }
        }
        ServerList.servers.push(entry);
        ServerList.writeServers();
    };
    ServerList.remove = function (satellite, id) {
        for (var i = 0; i < ServerList.servers.length; i++) {
            var s = ServerList.servers[i];
            if (s.id === id && s.responsibleSatelliteId === satellite) {
                ServerList.servers.splice(i, 1);
                ServerList.writeServers();
                return;
            }
        }
    };
    ServerList.get = function (satellite, id) {
        for (var _i = 0, _a = ServerList.servers; _i < _a.length; _i++) {
            var s = _a[_i];
            if (s.id === id && s.responsibleSatelliteId === satellite) {
                return s;
            }
        }
    };
    ServerList.servers = [];
    return ServerList;
}());
exports.ServerList = ServerList;

import * as fs from 'fs';
import {Configuration} from './configuration';
import {writeFileSync} from 'fs';

let SERVER_LIST_PATH;

export class ServerEntry {
    id: string;
    responsibleSatelliteId: string;
    testUrl: string;
    // TODO: implement Interval in seconds
    interval?: number;

/*
    constructor(id: string) {
        this.id = id;
    }
*/
}

export class ServerList {
    static servers: ServerEntry[] = [];

    static initialize() {
        SERVER_LIST_PATH = Configuration.get('serverListPath');
        ServerList.readServers()
    }

    static readServers() {
        try {
            let temp: any = fs.readFileSync(SERVER_LIST_PATH, 'utf8');
            temp = JSON.parse(temp);
            ServerList.servers = temp;
        } catch (e) {
            console.log('error reading', SERVER_LIST_PATH, e);
        }
    }

    static writeServers() {
        fs.writeFileSync(SERVER_LIST_PATH, JSON.stringify(ServerList.servers), 'utf8');
    }

    static add(entry: ServerEntry) {
        for (let s of ServerList.servers) {
            if (s.id === entry.id && s.responsibleSatelliteId === entry.responsibleSatelliteId) {
                s.testUrl = entry.testUrl;
                s.interval = entry.interval;
                return;
            }
        }
        ServerList.servers.push(entry);
        ServerList.writeServers();
    }

    static remove(satellite: string, id: string) {
        for (let i = 0; i < ServerList.servers.length; i++) {
            const s = ServerList.servers[i];
            if (s.id === id && s.responsibleSatelliteId === satellite) {
                ServerList.servers.splice(i, 1);
                ServerList.writeServers();
                return;
            }
        }
    }

    static get(satellite: string, id: string) {
        for (let s of ServerList.servers) {
            if (s.id === id && s.responsibleSatelliteId === satellite) {
                return s;
            }
        }
    }
}


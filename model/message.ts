import UuidStatic = require('uuid');
import {ServerEntry} from './server-list';
import {ServiceEntry} from './service-entry';

export enum OPS {
    PRESENCE = 'PRESENCE',
    REGISTER_SERVICE = 'REGISTER_SERVICE',
    UNREGISTER_SERVICE = 'UNREGISTER_SERVICE',
    STATUS_UPDATE = 'STATUS_UPDATE',
    ALERT = 'ALERT'
}

export class RequestMessage {
    id: string;
    timestamp: Date;
    op: string;
    senderId: string;
    payload: any;

    constructor() {
        this.id = UuidStatic.v4();
        this.timestamp = new Date();
    }
}

export class ResponseMessage {
    id: string;
    timestamp: Date;
    senderId: string;
    op: OPS;
    status: number;
    payload: any;
    constructor() {
        this.id = UuidStatic.v4();
        this.timestamp = new Date();
    }
}

// sub classes

export class RegistrationMessage extends RequestMessage {
    id: string;
    op: string;
    senderId: string;
    payload: ServerEntry;

    constructor() {
        super();
        this.op = OPS.REGISTER_SERVICE
    }
}

export class AlertMessage extends RequestMessage {
    id: string;
    op: string;
    senderId: string;
    recipientId: string;
    serviceId: string;
    payload: any;
    constructor() {
        super();
        this.op = OPS.ALERT
    }
}

export class RestartResponse extends ResponseMessage {
    status: number;
    op: OPS;
    payload: ServiceEntry;
    errore: any;

    constructor() {
        super();
        this.op = OPS.STATUS_UPDATE
    }

}

export class StatusUpdateResponse extends ResponseMessage {
    id: string;
    timestamp: Date;
    senderId: string;
    op: OPS;
    status: number;
    payload: any;

}
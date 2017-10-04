"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var UuidStatic = require("uuid");
var OPS;
(function (OPS) {
    OPS["PRESENCE"] = "PRESENCE";
    OPS["REGISTER_SERVICE"] = "REGISTER_SERVICE";
    OPS["UNREGISTER_SERVICE"] = "UNREGISTER_SERVICE";
    OPS["STATUS_UPDATE"] = "STATUS_UPDATE";
    OPS["ALERT"] = "ALERT";
})(OPS = exports.OPS || (exports.OPS = {}));
var RequestMessage = (function () {
    function RequestMessage() {
        this.id = UuidStatic.v4();
        this.timestamp = new Date();
    }
    return RequestMessage;
}());
exports.RequestMessage = RequestMessage;
var ResponseMessage = (function () {
    function ResponseMessage() {
        this.id = UuidStatic.v4();
        this.timestamp = new Date();
    }
    return ResponseMessage;
}());
exports.ResponseMessage = ResponseMessage;
// sub classes
var RegistrationMessage = (function (_super) {
    __extends(RegistrationMessage, _super);
    function RegistrationMessage() {
        var _this = _super.call(this) || this;
        _this.op = OPS.REGISTER_SERVICE;
        return _this;
    }
    return RegistrationMessage;
}(RequestMessage));
exports.RegistrationMessage = RegistrationMessage;
var AlertMessage = (function (_super) {
    __extends(AlertMessage, _super);
    function AlertMessage() {
        var _this = _super.call(this) || this;
        _this.op = OPS.ALERT;
        return _this;
    }
    return AlertMessage;
}(RequestMessage));
exports.AlertMessage = AlertMessage;
var RestartResponse = (function (_super) {
    __extends(RestartResponse, _super);
    function RestartResponse() {
        var _this = _super.call(this) || this;
        _this.op = OPS.STATUS_UPDATE;
        return _this;
    }
    return RestartResponse;
}(ResponseMessage));
exports.RestartResponse = RestartResponse;
var StatusUpdateResponse = (function (_super) {
    __extends(StatusUpdateResponse, _super);
    function StatusUpdateResponse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StatusUpdateResponse;
}(ResponseMessage));
exports.StatusUpdateResponse = StatusUpdateResponse;

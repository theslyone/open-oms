var EventEmitter = require('events');
class Initiator extends EventEmitter { }

Initiator.prototype.send = function (obj, callback) {
    callback();
}

Initiator.prototype.getSession = function (sessionID) {
    return {
        senderSeqNum: 0,
        targetSeqNum:0
    };
}

Initiator.prototype.getSessions = function () {
    return [{session:0}];
}


module.exports = {
    initiator: Initiator
};
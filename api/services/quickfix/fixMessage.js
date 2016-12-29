var fix = require('nse-fix');
var df = require('dateformat');

fixMessage = function(MsgType) {
    var obj = {
        header: {

        },
        tags: {

        },
        trailer: {

        }
    };

    obj.header[fix.fields.BeginString.Tag] = 'FIXT.1.1';
    obj.header[fix.fields.BodyLength.Tag] = '500';
    obj.header[fix.fields.MsgType.Tag] = MsgType;
    obj.header[fix.fields.SenderCompID.Tag] = 'MAXI';
    obj.header[fix.fields.TargetCompID.Tag] = 'XTRM';
    //obj.header[fix.fields.MsgSeqNum.Tag] = 0;
    obj.header[fix.fields.SendingTime.Tag] = new Date();
    obj.trailer[fix.fields.CheckSum.Tag] = "";
    return obj;
}


module.exports = fixMessage;

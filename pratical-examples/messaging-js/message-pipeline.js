const { Pipeline } = require( "../../lib");
const MessageSendProcedure = require('./message-send');
const NotificationProcedure = require("./message-notification");

class MessagePipeline extends Pipeline {};

const pipeline = new MessagePipeline({ lifetime: 'DURABLE' })
.addStep(new MessageSendProcedure())
.addStep(new NotificationProcedure('New Message Recieved!'));

module.exports = pipeline;
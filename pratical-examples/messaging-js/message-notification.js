const { Procedure } = require("../../lib");

module.exports = class NotificationProcedure extends Procedure {
  constructor (baseMessage) {
    super();
    this.baseMessage = baseMessage;
  }

  execute(context) {
    console.log(
      `${this.baseMessage}\n` +
      ` - room: ${context.chatRoomName}\n` +
      ` - author: ${context.latestMessage.author}\n` +
      ` - message: ${context.latestMessage.content}`
    );

    console.log(`\n [ Message visible to ${context.participants.length} user(s) ] \n`)
  }
}

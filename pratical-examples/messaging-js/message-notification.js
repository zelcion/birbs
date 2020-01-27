const { Procedure } = require("../../lib");

module.exports = class NotificationProcedure extends Procedure {
  constructor (baseMessage) {
    super();
    this.baseMessage = baseMessage;
  }

  async execute(context, message) {
    console.log(
      `${this.baseMessage}\n` +
      ` - room: ${context.chatRoomName}\n` +
      ` - author: ${message.author}\n` +
      ` - message: ${message.content}`
    );

    console.log(`\n [ Message visible to ${context.participants.length} user(s) ] \n`);
  }
}

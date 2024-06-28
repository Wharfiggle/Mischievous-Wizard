var { generateSlashData, execute, executeManual, transformMessage } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ generateSlashData, execute, executeManual, transformMessage } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("enlarge", "Makes a user speak in bolded, all caps text for 1 minute."),
	async execute(interaction)
	{
		const effects = await execute("enlarge", interaction);
		if(effects)
			effects.delete("reduce");
	},
	async executeManual(message, commandEndIndex)
	{
		const effects = await executeManual("enlarge", message, commandEndIndex);
		if(effects)
			effects.delete("reduce");
	},
	transformMessage(msgInfo, effectInfo)
	{
		msgInfo.outputMessage = "**" + msgInfo.outputMessage.toUpperCase() + "**";
		return msgInfo;
	}
};
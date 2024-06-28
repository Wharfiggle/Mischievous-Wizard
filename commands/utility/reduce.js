const superscript = require("superscript-text");
var { generateSlashData, execute, executeManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ generateSlashData, execute, executeManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("reduce", "Makes a user speak in tiny text for 1 minute."),
	async execute(interaction)
	{
		const effects = await execute("reduce", interaction);
		if(effects)
			effects.delete("enlarge");
	},
	async executeManual(message, commandEndIndex)
	{
		const effects = await executeManual("reduce", message, commandEndIndex);
		if(effects)
			effects.delete("enlarge");
	},
	transformMessage(msgInfo, effectInfo)
	{
		msgInfo.outputMessage = superscript(msgInfo.outputMessage.toLowerCase());
		return msgInfo;
	}
};
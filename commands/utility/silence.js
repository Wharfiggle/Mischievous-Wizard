var { getMember, applyEffect, removeEffect, generateSlashData, execute, executeManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ getMember, applyEffect, removeEffect, generateSlashData, execute, executeManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("silence", "Silence a user for 1 minute.", "The user to silence."),
	async execute(interaction)
	{
		const target = await execute(interaction);
		if(target)
		{
			await removeEffect("enlarge", target, interaction);
            await removeEffect("reduce", target, interaction);
			await applyEffect("silence", target, interaction);
		}
	},
	async executeManual(message, commandEndIndex)
	{
		const target = await executeManual(message, commandEndIndex);
		if(target)
		{
            await removeEffect("enlarge", target, message);
            await removeEffect("reduce", target, message);
			await applyEffect("silence", target, message);
		}
	},
	transformMessage(msgInfo, effectInfo)
	{
		msgInfo.outputMessage = "** **";
		
		return msgInfo;
	}
};
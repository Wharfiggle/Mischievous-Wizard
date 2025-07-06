const superscript = require("superscript-text");
var { applyEffect, removeEffect, generateSlashData, execute, executeManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ applyEffect, removeEffect, generateSlashData, execute, executeManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("reduce", "Makes a user speak in tiny text for 1 minute."),
	async execute(interaction)
	{
		const target = await execute(interaction);
		if(target)
		{
			await removeEffect("enlarge", target, interaction);
			await removeEffect("silence", target, interaction);
			await applyEffect("reduce", target, interaction);
		}
	},
	async executeManual(message, commandEndIndex)
	{
		const target = await executeManual(message, commandEndIndex);
		if(target)
		{
			await removeEffect("enlarge", target, message);
			await removeEffect("silence", target, message);
			await applyEffect("reduce", target, message);
		}
	},
	transformMessage(msgInfo, effectInfo)
	{
		//find and exclude custom emojis from being changed to superscript
		const exclude = [...msgInfo.outputMessage.matchAll(/<:\w+:\d+>/g)];
		var charsRemoved = 0;
		//remove custom emojis from string
		for(e of exclude)
		{
			const ind = e.index - charsRemoved; //account for chars before this that were removed from the string
			msgInfo.outputMessage = msgInfo.outputMessage.substring(0, ind) + msgInfo.outputMessage.substring(ind + e[0].length);
			charsRemoved += e[0].length;
		}

		//change letters and numbers to superscript
		var str = "";
		for(c of msgInfo.outputMessage)
		{
			var charLower = c.toLowerCase();
			if((charLower >= 'a' && charLower <= 'z') || (charLower >= '0' && charLower <= '9'))
				str += superscript(charLower);
			else
				str += charLower;
		}
		msgInfo.outputMessage = str;
		
		//add custom emojis back in
		for(e of exclude)
		{
			const ind = e.index;
			msgInfo.outputMessage = msgInfo.outputMessage.substring(0, ind) + e[0] + msgInfo.outputMessage.substring(ind);
		}

		return msgInfo;
	}
};
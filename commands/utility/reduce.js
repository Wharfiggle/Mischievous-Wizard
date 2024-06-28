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
				str += superscript(c);
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
var { getMember, applyEffect, removeEffect, generateSlashData, execute, executeManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ getMember, applyEffect, removeEffect, generateSlashData, execute, executeManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("disguiseself", "Disguise yourself as another user for 1 minute.", "The user to disguise yourself as."),
	async execute(interaction)
	{
		const target = await execute(interaction);
		if(target)
		{
			const effects = await applyEffect("disguiseself", interaction.author.username, interaction);
			await removeEffect("polymorph", interaction.author.username, interaction);
			effects.get("disguiseself").member = await getMember(target, interaction);
		}
	},
	async executeManual(message, commandEndIndex)
	{
		const target = await executeManual(message, commandEndIndex);
		if(target)
		{
			const effects = await applyEffect("disguiseself", message.author.username, message);
			await removeEffect("polymorph", message.author.username, message);
			effects.get("disguiseself").member = await getMember(target, message);
		}
	},
	transformMessage(msgInfo, effectInfo)
	{
		msgInfo.outputName = effectInfo.member.nickname ? effectInfo.member.nickname : effectInfo.member.user.username;
		msgInfo.outputAvatar = effectInfo.member.webhookAvatar ? effectInfo.member.webhookAvatar : effectInfo.member.displayAvatarURL();
		
		return msgInfo;
	}
};
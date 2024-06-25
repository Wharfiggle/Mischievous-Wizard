var { generateSlashData, userEffectExecute, userEffectExecuteManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ generateSlashData, userEffectExecute, userEffectExecuteManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("reduce", "Makes a user speak in tiny text for 1 minute."),
	async execute(interaction)
	{
		const effects = await userEffectExecute("reduce", interaction);
		if(effects)
			effects.delete("enlarge");
	},
	async executeManual(message, commandEndIndex)
	{
		const effects = await userEffectExecuteManual("reduce", message, commandEndIndex);
		if(effects)
			effects.delete("enlarge");
	}
};
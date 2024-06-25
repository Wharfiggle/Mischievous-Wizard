var { generateSlashData, userEffectExecute, userEffectExecuteManual } = require("../templates/user_effect_command.js");

module.exports = 
{
	refreshTemplate(client)
	{ ({ generateSlashData, userEffectExecute, userEffectExecuteManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("enlarge", "Makes a user speak in bolded, all caps text for 1 minute."),
	async execute(interaction)
	{
		const effects = await userEffectExecute("enlarge", interaction);
		if(effects)
			effects.delete("reduce");
	},
	async executeManual(message, commandEndIndex)
	{
		const effects = await userEffectExecuteManual("enlarge", message, commandEndIndex);
		if(effects)
			effects.delete("reduce");
	}
};
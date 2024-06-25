var { generateSlashData, userEffectExecute, userEffectExecuteManual } = require("../templates/user_effect_command.js");

function getRandomAnimal()
{
	//get random animal to turn user into
	const animals = [ "cow", "chicken", "cat", "dog", "horse", "sheep" ];
	const rn = Math.floor(Math.random() * animals.length);

	return animals[rn];
}

module.exports = 
{
	refreshTemplate(client)
	{ ({ generateSlashData, userEffectExecute, userEffectExecuteManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("polymorph", "Turns a user into a random animal for 1 minute."),
	async execute(interaction)
	{
		const effects = await userEffectExecute("polymorph", interaction);
		if(effects)
			effects.get("polymorph").animal = getRandomAnimal();
	},
	async executeManual(message, commandEndIndex)
	{
		const effects = await userEffectExecuteManual("polymorph", message, commandEndIndex);
		if(effects)
			effects.get("polymorph").animal = getRandomAnimal();
	}
};
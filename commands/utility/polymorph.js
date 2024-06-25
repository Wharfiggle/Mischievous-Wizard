const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

module.exports = 
{
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: new SlashCommandBuilder().setName("polymorph").setDescription("Turns a user into a random animal for 1 minute.")
	.addUserOption(option =>
		option.setName("user")
			.setDescription("The user to Polymorph.")
			.setRequired(false)),
	async execute(interaction)
	{
		//get user
        var user = interaction.options.getUser("user");
        if(user == undefined)
            user = interaction.user;

		//get all userEffects
		const { userEffects } = interaction.client;

		//get effects for user
		if(!userEffects.has(user.username))
			userEffects.set(user.username, new Collection());
		const effects = userEffects.get(user.username);

		//get random animal to turn user into
		const animals = [ "cow", "chicken", "cat", "dog", "horse", "sheep" ];
		const rn = Math.floor(Math.random() * animals.length);

		//add or overwrite polymorph effect on user
		//set expireTime to -1 so we know to overwrite it whenever the user speaks next
		effects.set("polymorph", { expireTime: -1, animal: animals[rn] });

		await interaction.reply({ content: `Successfully cast Polymorph on ${user.displayName}!`, ephemeral: true});
	}
};

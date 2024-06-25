const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

module.exports = 
{
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: new SlashCommandBuilder().setName("enlarge").setDescription("Makes a user speak in bolded, all caps text for 1 minute.")
	.addUserOption(option =>
		option.setName("user")
			.setDescription("The user to enlarge.")
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
		var effects = userEffects.get(user.username);

		//remove any reduce effect currently on user
		effects.delete("reduce");

		//add or overwrite enlarge effect on user
		//set expireTime to -1 so we know to overwrite it whenever the user speaks next
		effects.set("enlarge", { expireTime: -1 });

		await interaction.reply({ content: `Successfully cast Enlarge on ${user.displayName}!`, ephemeral: true});
	}
};

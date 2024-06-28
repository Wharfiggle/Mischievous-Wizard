const { SlashCommandBuilder } = require("discord.js");

module.exports =
{
	cooldown: 0,
	data: new SlashCommandBuilder().setName("reload").setDescription("Reloads a command.")
		.addStringOption(option =>
			option.setName("command")
				.setDescription("The command to reload.")
				.setRequired(true)),
	async execute(interaction)
	{
		const commandName = interaction.options.getString("command", true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if(!command)
			return interaction.reply(`There is no command with name \`${commandName}\`!`);

		const folder = interaction.client.templates.includes(commandName) ? "templates" : "utility";

		//requiring a file will cache it, so requiring it again will load the old cached version.
		//because of this we need to delete the version of the command file in the require cache
		delete require.cache[require.resolve(`../${folder}/${commandName}.js`)];

		try
		{
			//load updated command, overwrite old command in commands collection
			const newCommand = require(`../${folder}/${commandName}.js`);
			interaction.client.commands.set(commandName, newCommand);

			//if command is a template, commands need to refresh their reference to it
			if(folder == "templates")
			{
				for(c of interaction.client.commands)
				{
					if(c[1].refreshTemplate)
						c[1].refreshTemplate(interaction.client);
				}
			}

			await interaction.reply(`Command \`${commandName}\` was reloaded!`);
		}
		catch(error)
		{
			console.error(error);
			await interaction.reply(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
		}
	}
};
const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

async function enlarge(username, replier, manual = false)
{
	//if no username was provided, get username of last message sent before command
	if(!username)
	{
		const numMessages = 10;
		const messages = await replier.channel.messages.fetch({ limit: numMessages });
		var i = 0;
		for(m of messages)
		{
			if(m[1].author.username == "Mischievous Wizard")
				continue;
			if(i == 0 && !manual)
			{
				username = m[1].author.username;
				break;
			}
			else if(i > 0)
			{
				username = m[1].author.username;
				break;
			}
			i++;
		}
		if(!username) //couldn't find any messages besides ones from our webhook
		{
			await replier.reply({ content: "Couldn't find a target for Enlarge.", ephemeral: true});
			return;
		}
	}

	//get all userEffects
	const { userEffects } = replier.client;

	//get effects for user
	if(!userEffects.has(username))
		userEffects.set(username, new Collection());
	var effects = userEffects.get(username);

	//remove any enlarge effect currently on user
	effects.delete("reduce");

	//add or overwrite enlarge effect on user
	//set expireTime to -1 so we know to overwrite it whenever the user speaks next
	effects.set("enlarge", { expireTime: -1 });

	await replier.reply({ content: `Successfully cast Enlarge on ${username}!`, ephemeral: true});
}

module.exports = 
{
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: new SlashCommandBuilder().setName("enlarge").setDescription("Makes a user speak in bolded, all caps text for 1 minute.")
	.addUserOption(option =>
		option.setName("user")
			.setDescription("The user to Enlarge.")
			.setRequired(false)),
	async execute(interaction)
	{
		var user = interaction.options.getUser("user");
		enlarge(user ? user.username : undefined, interaction);
	},
	async executeManual(message, commandEndIndex)
	{
		var user;
		if(commandEndIndex) //something typed after command
		{
			user = message.content.match(/(?<=<@)\d+(?=>)/); //get user id
			if(user) //user id was found
			{
				user = await message.client.users.fetch(user[0]);
				if(user) //user id was valid
					user = user.username;
			}
			else
			{
				user = message.content.substring(commandEndIndex + 1);
				if(!user.match(/\w/)) //username manually entered has no letters, so it's a censored message and we should ignore the request
					return;
			}
		}
		enlarge(user, message, true);
	}
};
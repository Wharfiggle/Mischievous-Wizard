const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

async function polymorph(username, replier, manual = false)
{
	//if no username was provided, get username of the message replied to
	if(manual && !username)
	{
		const repliedMsg = await replier.channel.messages.fetch(replier.reference.messageId);
		if(repliedMsg)
		{
			username = repliedMsg.author.username;
			if(username == "Mischievous Wizard") //cannot let users cast spells on Mischievous Wizard
				username = undefined;
		}
		else
			console.log("no reply message found");
	}
	//if no message was replied to, get username of last message sent before command
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
			await replier.reply({ content: "Couldn't find a target for Polymorph.", ephemeral: true});
			return;
		}
	}

	//get all userEffects
	const { userEffects } = replier.client;

	//get effects for user
	if(!userEffects.has(username))
		userEffects.set(username, new Collection());
	var effects = userEffects.get(username);

	//get random animal to turn user into
	const animals = [ "cow", "chicken", "cat", "dog", "horse", "sheep" ];
	const rn = Math.floor(Math.random() * animals.length);

	//add or overwrite polymorph effect on user
	//set expireTime to -1 so we know to overwrite it whenever the user speaks next
	effects.set("polymorph", { expireTime: -1, animal: animals[rn] });

	await replier.reply({ content: `Successfully cast Polymorph on ${username}!`, ephemeral: true});
}

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
		var user = interaction.options.getUser("user");
		polymorph(user ? user.username : undefined, interaction);
	},
	async executeManual(message, commandEndIndex)
	{
		var user;
		if(commandEndIndex != -1) //something typed after command
		{
			user = message.content.match(/(?<=<@)\d+(?=>)/); //get user id
			if(user) //user id was found
			{
				user = await message.client.users.fetch(user[0]);
				if(user) //user id was valid
					user = user.username;
			}
			if(!user)
			{
				user = message.content.substring(commandEndIndex + 1);
				if(!user.match(/\w/)) //username manually entered has no letters, so it's a censored message and we should ignore the request
					return;
			}
		}
		polymorph(user, message, true);
	}
};
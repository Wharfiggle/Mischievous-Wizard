const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

async function findTarget(username, replier, manual = false)
{
	//if no username was provided, get username of the message replied to
	if(!username && replier.reference)
	{
		const repliedMsg = await replier.channel.messages.fetch(replier.reference.messageId);
		if(repliedMsg)
		{
			username = repliedMsg.author.username;
			//if(username == "Mischievous Wizard") //cant let users target the wizard, will cause an infinite loop
			//	username = replier.author.username;
		}
	}
	//if no message was replied to, get username of last message sent before command
	if(!username)
	{
		const numMessages = 20;
		const messages = await replier.channel.messages.fetch({ limit: numMessages });
		var i = 0;
		for(m of messages)
		{
			//if(m[1].author.username == "Mischievous Wizard")
			//	continue;
			if((i == 0 && !manual) || i > 0)
			{
				username = m[1].author.username;
				break;
			}
			i++;
		}
		if(!username) //couldn't find any messages besides ones from our webhook
		{
			await replier.reply({ content: `Couldn't find a valid target.`, ephemeral: true});
			return;
		}
	}

	return username;
}

module.exports = 
{
	async applyEffect(effect, username, replier, successMessage = "")
	{
		//get all userEffects
		const userEffects = replier.client.userEffects;

		//get effects for user
		if(!userEffects.has(username))
			userEffects.set(username, new Collection());
		var effects = userEffects.get(username);

		//add or overwrite effect on user
		//set expireTime to -1 so we know to overwrite it whenever the user speaks next
		effects.set(effect, { expireTime: -1 });

		//await replier.reply({ content: `Successfully cast ${effect} on ${username}!`, ephemeral: true });
		if(successMessage == "")
			successMessage = `Successfully cast ${effect} on ${username}!`;
		await replier.reply({ content: successMessage, ephemeral: true });

		return effects;
	},
	async getMember(username, replier)
	{
		console.log(`searching for member ${username}`);
		var members = await replier.guild.members.fetch();
		var member = await members.find(m => m.user.username == username); //assume member username
		if(!member) //member not found, assume member nickname
		{
			var member = await members.find(m => m.nickname == username); //assume member username
			if(!member) //member not found, must be a webhook
			{
				console.log(`no member with username or nickname ${username}, assuming a bot`);
				var avatar = replier.client.webhookAvatars.get(username);
				if(!avatar) //avatar isnt cached
				{
					console.log("had to fetch webhook avatar from message history");
					const numMessages = 50;
					const messages = await replier.channel.messages.fetch({ limit: numMessages });
					for(m of messages)
					{
						if(m[1].webhookId && m[1].author.username == username && m[1].author.avatar)
						{
							avatar = "https://cdn.discordapp.com/avatars/" + m[1].author.id + "/" + m[1].author.avatar + ".jpeg";
							replier.client.webhookAvatars.set(username, avatar);
							break;
						}
					}
				}
				else
					console.log("found avatar in cache");

				return { nickname: username, webhookAvatar: avatar, user:{ username: username } };
			}
		}
		
		return member;
	},
	async removeEffect(effect, username, replier)
	{
		const member = await module.exports.getMember(username, replier);

		const usernameEffects = replier.client.userEffects.get(member.user.username);
		if(usernameEffects)
			usernameEffects.delete(effect);
		const nicknameEffects = replier.client.userEffects.get(member.nickname);
		if(nicknameEffects)
			nicknameEffects.delete(effect);

		return member;
	},
	generateSlashData(effect, description, argDescription = undefined)
    {
        return new SlashCommandBuilder().setName(effect).setDescription(description)
	    .addUserOption(option =>
		    option.setName("user")
			    .setDescription(argDescription ? argDescription : `The user to ${effect}.`)
			    .setRequired(false));
    },
	async execute(interaction)
	{
		var user = interaction.options.getUser("user");
		return await findTarget(user ? user.username : undefined, interaction);
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
			if(!user) //no user mentioned so no id, use text typed after command as username
			{
				user = message.content.substring(commandEndIndex + 1);
				if(!user.match(/\w/)) //username manually entered has no letters, so it's a censored message and we should ignore the request
					return;
				else if(user.toLowerCase() == "me" || user.toLowerCase() == "myself") //|| user == "Mischievous Wizard") //cant let users target the wizard
					user = message.author.username;
			}
		}
		
		return await findTarget(user, message, true);
	}
};
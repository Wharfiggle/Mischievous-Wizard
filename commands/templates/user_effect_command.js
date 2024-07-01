const { SlashCommandBuilder } = require("discord.js");
const { Collection } = require("discord.js");

async function applyEffect(effect, username, replier, manual = false)
{
	//if no username was provided, get username of the message replied to
	if(!username && replier.reference)
	{
		const repliedMsg = await replier.channel.messages.fetch(replier.reference.messageId);
		if(repliedMsg)
		{
			username = repliedMsg.author.username;
			if(username == "Mischievous Wizard") //cant let users target the wizard, will cause an infinite loop
				username = replier.author.username;
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
			await replier.reply({ content: `Couldn't find a target for ${effect}.`, ephemeral: true});
			return;
		}
	}

	//get all userEffects
	const userEffects = replier.client.userEffects;

	//get effects for user
	if(!userEffects.has(username))
		userEffects.set(username, new Collection());
	var effects = userEffects.get(username);

	//add or overwrite effect on user
	//set expireTime to -1 so we know to overwrite it whenever the user speaks next
	effects.set(effect, { expireTime: -1 });

	await replier.reply({ content: `Successfully cast ${effect} on ${username}!`, ephemeral: true});

    return [username, effects];
}

module.exports = 
{
	async removeEffect(effect, replier, effects)
	{
		console.log(replier.content);
		console.log(effects);

		effects[1].delete(effect); //delete reduce from currents username or nickname's effects

		//find our member assuming we're using a username
		const members = await replier.guild.members.list();
		var member = await members.find(m => m.user.username == effects[0]);
		if(!member) //not a username
		{
			member = await members.find(m => m.nickname == effects[0]);
			if(!member) //not a nickname either, user is either not valid or isnt a member (likely a webhook)
				return;
			else
			{
				//get effects under member username and remove effect
				const pairEffects = replier.client.userEffects.get(member.user.username);
				if(pairEffects)
					pairEffects.delete(effect);
			}
		}
		else
		{
			//get effects under member nickname and remove effect
			const pairEffects = replier.client.userEffects.get(member.nickname);
			if(pairEffects)
				pairEffects.delete(effect);
		}
	},
	generateSlashData(effect, description)
    {
        return new SlashCommandBuilder().setName(effect).setDescription(description)
	    .addUserOption(option =>
		    option.setName("user")
			    .setDescription(`The user to ${effect}.`)
			    .setRequired(false))
    },
	async execute(effect, interaction)
	{
		var user = interaction.options.getUser("user");
		return await applyEffect(effect, user ? user.username : undefined, interaction);
	},
	async executeManual(effect, message, commandEndIndex)
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
				else if(user.toLowerCase() == "me" || user.toLowerCase() == "myself" || user == "Mischievous Wizard") //cant let users target the wizard
					user = message.author.username;
			}
		}
		return await applyEffect(effect, user, message, true);
	}
};
const express = require("express");
const app = express();

app.listen(3003, () => 
{ console.log("Project is running!"); });

app.get("/", (req, res) => 
{ res.send("Hello world!"); });

// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
//this is called object destructuring
//creates a new const variable for each element in the {} and assigns them
//the values of the variables with the same names from the required module (discord.js)
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

client.commands = new Collection();
client.templates = [];
client.cooldowns = new Collection();

//set up all commands in commands folder
const foldersPath = path.join(__dirname, "commands"); //append "commands" to directory path to get path to commands folder
const commandFolders = fs.readdirSync(foldersPath); //get all folders in commands folder
for(const folder of commandFolders) //iterate through each folder in commands folder
{
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js")); //get all js files in folder
	for(const file of commandFiles)
	{
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if(folder == "templates")
		{
			const name = file.substring(0, file.indexOf(".")); //file name with no extenstion
			client.commands.set(name, command);
			client.templates.push(name);
		}
		else if("data" in command && "execute" in command)
			client.commands.set(command.data.name, command);
		else
			//			V backticks, not apostrophes. Can only do string interpolation with backticks
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//set up all events in events folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for(const file of eventFiles)
{
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if(event.once)
		client.once(event.name, (...args) => event.execute(...args));
	else
		client.on(event.name, (...args) => event.execute(...args));
}



//		custom code for mischievous wizard

client.userEffects = new Collection(); //effects on each user stored in this

const webhooks = new Collection();
client.on('messageCreate', async (message) =>
{
	var isWebhook = false;
	if(message.webhookId) //is a webhook
	{
		isWebhook = true;
		const firstWebhook = webhooks.first();
		if(firstWebhook && firstWebhook.id == message.webhookId) //webhook is ours
			return;
	}

	//manual commands
	const prefixMatch = message.content.toLowerCase().match(/^(i cast\.*|🪄|🧙‍♀️|🧙|🧙‍♂️)\s*/);
	if(prefixMatch)
	{
		const prefix = prefixMatch[0];
		var commandEndIndex = message.content.indexOf(" ", prefix.length); //index of first space in string after prefix
		const command = message.content.substring(prefix.length, (commandEndIndex == -1) ? undefined : commandEndIndex).toLowerCase();
		//allow for user to say "on" after the command
		if(commandEndIndex != -1)
		{
			if(message.content.substring(commandEndIndex + 1, commandEndIndex + 4).toLowerCase() == "on ")
				commandEndIndex += 3;
		}

		try
		{
			if(command == "enlarge")
			{
				const enlarge = client.commands.get("enlarge");
				await enlarge.executeManual(message, commandEndIndex);
				return;
			}
			else if(command == "reduce")
			{
				const reduce = client.commands.get("reduce");
				await reduce.executeManual(message, commandEndIndex);
				return;
			}
			else if(command == "polymorph")
			{
				const polymorph = client.commands.get("polymorph");
				await polymorph.executeManual(message, commandEndIndex);
				return;
			}
		}
		catch(error)
		{
			console.error(error);
			await message.reply({ content: "There was an error while executing this command!", ephemeral: true });
			return;
		}
	}

	//get userEffects from client
	const { userEffects } = client;

	var origEffects = userEffects.get(message.author.username); //passed as reference so changes update for client.userEffects
	var effects = origEffects;
	//get effects under nickname as well
	var nickEffects;
	if(!isWebhook)
	{
		nickEffects = userEffects.get(message.member.nickname);
		if(nickEffects)
		{
			if(origEffects)
				effects = origEffects.concat(nickEffects); //combine into one collection
			else
				effects = nickEffects;
		}
	}
	if(!effects) //no effects on user
		return;

	//delete effects from collection if they've expired
	const now = Date.now();
	for(e of effects) //e[0]: map key	e[1]: value
	{
		if(e[1].expireTime == -1)
		{
			e[1].expireTime = now + 60000; //milliseconds, equal to 1 minute
			userEffects.set(e[0], e[1]); //apply change to userEffects
		}
		else if(e[1].expireTime < now) //expiration time for effect has passed
		{
			//delete from original collections as well since changes to effects do not update for client.userEffects
			if(origEffects) origEffects.delete(e[0]);
			if(nickEffects) nickEffects.delete(e[0]);
			effects.delete(e[0]);
		}
	}

	//no non-expired effects remaining
	if(effects.size == 0)
	{
		userEffects.delete(message.author.username);
		if(!isWebhook)
			userEffects.delete(message.member.nickname);
		return;
	}

	//default message variables
	var msgInfo =
	{
		outputName : isWebhook || !message.member.nickname ? message.author.username : message.member.nickname,
		outputMessage : message.content,
		outputAvatar : message.author.displayAvatarURL()
	}

	//rare case where one showed up in origEffects and one showed up in nickEffects, need to remove whichever's earlier
	if(effects.has("enlarge") && effects.has("reduce"))
	{
		var enlarge = effects.get("enlarge");
		var reduce = effects.get("reduce");
		var toDelete;
		if(enlarge.expireTime == -1 || enlarge.expireTime > reduce.expireTime)
			toDelete = "reduce";
		else
			toDelete = "enlarge";
		if(origEffects) origEffects.delete(toDelete);
		if(nickEffects) nickEffects.delete(toDelete);
		effects.delete(toDelete);
	}

	//sort effects based on order of effect names in effectPriority
	//need effects to be applied in a certain order for best results
	const effectPriority = ["polymorph", "enlarge", "reduce"];
	effects = [...effects.entries()].sort( (a, b) => effectPriority.indexOf(a[0]) < effectPriority.indexOf(b[0]) );

	//apply each effect to msgInfo variables
	for(e of effects)
	{
		msgInfo = client.commands.get(e[0]).transformMessage(msgInfo, e[1]);
	}

	//get appropriate webhook and send message with it
	try
	{
		//find our webhook among the previously used webhooks
		var webhook = webhooks.get(message.channel);

		if(!webhook) //havent used the needed webhook yet
		{
			//find our webhook in the server
			const foundWebhooks = await message.channel.fetchWebhooks();
			webhook = foundWebhooks.find(wh => wh.token);

			if(!webhook) //have not created a webhook in this channel so need to create one
			{
				await message.channel.createWebhook({ name: 'Mischievous Wizard' })
				.then(createdWebhook => 
				{
					webhook = createdWebhook;
					console.log(`Created webhook ${webhook.name}`);
				})
				.catch(createError =>
				{
					console.error(`Error while creating webhook: `, createError);
					return;
				});
			}

			webhooks.set(webhook.channel, webhook);
			if(webhook.id == message.webhookId)
				return;
		}

		await webhook.send(
		{
			content: msgInfo.outputMessage,
			username: msgInfo.outputName,
			avatarURL: msgInfo.outputAvatar
		});

		message.delete();
	}
	catch(error) { console.error('Error trying to send a message: ', error); }
});



// Log in to Discord with your client's token
const { token } = require("./config.json");
client.login(token);

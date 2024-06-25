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
		if("data" in command && "execute" in command)
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

const superscript = require("superscript-text");

client.userEffects = new Collection(); //effects on each user stored in this


//function for polymorph, takes message content for text and a word like "bah" for the blabword
//returns a string with the same number of words and similar capitalization as text but only using blabWord 
async function turnTextToBlabber(text, blabWord)
{
	var string = "";
	const words = text.split(" ");
	for(var w = 0; w < words.length; w++)
	{
		const word = words[w];
		var some = false; //some capitalization in word
		var first = false; //first character capitalized
		var all = true; //word is all caps

		//determine some, first, and all values based on all characters in word
		for(var i = 0; i < word.length; i++)
		{
			const char = word[i];
			const charUpper = char.toUpperCase();
			if(charUpper < 'A' || charUpper > 'Z') //not a letter
				continue;
			if(char == charUpper)
			{
				if(i == 0)
					first = true;
				else
					some = true;
			}
			else
				all = false;
		}

		//add characters from blabWord with varying capitalization based on some, first, and all
		for(var i = 0; i < blabWord.length; i++)
		{
			const char = blabWord[i];
			if(all)
				string += char.toUpperCase();
			else if(i == 0 && first)
				string += char.toUpperCase();
			else if(some)
				string += (string.length % 2 == 0) ? char.toUpperCase() : char
			else
				string += char;
		}

		//add space if not the last word
		if(w < words.length - 1)
			string += " ";
	}

	return string;
}


const webhooks = new Collection();
client.on('messageCreate', async (message) =>
{
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

		if(command == "enlarge")
		{
			const enlarge = client.commands.get("enlarge");
			await enlarge.executeManual(message, commandEndIndex);
		}
		if(command == "reduce")
		{
			const reduce = client.commands.get("reduce");
			await reduce.executeManual(message, commandEndIndex);
		}
		if(command == "polymorph")
		{
			const polymorph = client.commands.get("polymorph");
			await polymorph.executeManual(message, commandEndIndex);
		}

		return;
	}

	var isWebhook = false;
	if(message.webhookId) //is a webhook
	{
		isWebhook = true;
		if(webhooks.length > 0 && webhooks[0].id == message.webhookId) //webhook is ours
			return;
	}

	//get userEffects from client
	const { userEffects } = client;

	const effects = userEffects.get(message.author.username); //passed as reference so changes update for client.userEffects
	if(!effects) //user that made the message has no effects
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
			effects.delete(e[0]);
	}

	//no non-expired effects remaining
	if(effects.size == 0)
	{
		userEffects.delete(message.author.username);
		return;
	}

	//default message variables
	var outputName = isWebhook ? message.author.username : message.member.nickname;
	var outputMessage = message.content;
	var outputAvatar = message.author.displayAvatarURL();

	if(effects.has("polymorph"))
	{
		const polymorph = effects.get("polymorph");
		var blabWord;
		if(polymorph.animal == "cow")
		{
			blabWord = "moo";
			outputAvatar = "https://avatarfiles.alphacoders.com/259/259549.jpg";
		}
		else if(polymorph.animal == "chicken")
		{
			blabWord = "bok";
			outputAvatar = "https://avatarfiles.alphacoders.com/319/thumb-1920-319062.jpg";
		}
		else if(polymorph.animal == "cat")
		{
			blabWord = "meow";
			outputAvatar = "https://avatarfiles.alphacoders.com/259/thumb-1920-259025.jpg";
		}
		else if(polymorph.animal == "dog")
		{
			blabWord = "bark";
			outputAvatar = "https://avatarfiles.alphacoders.com/259/thumb-1920-259031.jpg";
		}
		else if(polymorph.animal == "horse")
		{	
			blabWord = "neigh";
			outputAvatar = "https://avatarfiles.alphacoders.com/445/thumb-1920-44563.jpg";
		}
		else if(polymorph.animal == "sheep")
		{
			blabWord = "bah";
			outputAvatar = "https://avatarfiles.alphacoders.com/308/thumb-1920-308683.jpg";
		}

		outputMessage = await turnTextToBlabber(outputMessage, blabWord);
	}
	if(effects.has("enlarge"))
		outputMessage = "**" + outputMessage.toUpperCase() + "**";
	if(effects.has("reduce"))
		outputMessage = superscript(outputMessage);

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
				await message.channel.createWebhook({ name: 'WebhookCensorer' })
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
		}

		await webhook.send(
		{
			content: outputMessage,
			username: outputName,
			avatarURL: outputAvatar
		});

		message.delete();
	}
	catch(error) { console.error('Error trying to send a message: ', error); }
});



// Log in to Discord with your client's token
const { token } = require("./config.json");
client.login(token);

var { applyEffect, removeEffect, generateSlashData, execute, executeManual } = require("../templates/user_effect_command.js");

//returns a string with the same number of words and similar capitalization as text but only using blabWord 
function turnTextToBlabber(text, blabWord)
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
	{ ({ applyEffect, removeEffect, generateSlashData, execute, executeManual } = client.commands.get("user_effect_command")); },
	publicCommand: true, //WILL BE DEPLOYED GLOBALLY
	cooldown: 5,
	data: generateSlashData("polymorph", "Turns a user into a random animal for 1 minute."),
	async execute(interaction)
	{
		const target = await execute(interaction);
		if(target)
		{
			const effects = await applyEffect("polymorph", target, interaction);
			await removeEffect("disguiseself", target, interaction);
			effects.get("polymorph").animal = getRandomAnimal();
		}
	},
	async executeManual(message, commandEndIndex)
	{
		const target = await executeManual(message, commandEndIndex);
		if(target)
		{
			const effects = await applyEffect("polymorph", target, message);
			await removeEffect("disguiseself", target, message);
			effects.get("polymorph").animal = getRandomAnimal();
		}
	},
	transformMessage(msgInfo, effectInfo)
	{
		var blabWord;
		if(effectInfo.animal == "cow")
		{
			blabWord = "moo";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/259/259549.jpg";
		}
		else if(effectInfo.animal == "chicken")
		{
			blabWord = "bok";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/319/thumb-1920-319062.jpg";
		}
		else if(effectInfo.animal == "cat")
		{
			blabWord = "meow";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/259/thumb-1920-259025.jpg";
		}
		else if(effectInfo.animal == "dog")
		{
			blabWord = "bark";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/259/thumb-1920-259031.jpg";
		}
		else if(effectInfo.animal == "horse")
		{	
			blabWord = "neigh";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/445/thumb-1920-44563.jpg";
		}
		else if(effectInfo.animal == "sheep")
		{
			blabWord = "bah";
			msgInfo.outputAvatar = "https://avatarfiles.alphacoders.com/308/thumb-1920-308683.jpg";
		}

		msgInfo.outputMessage = turnTextToBlabber(msgInfo.outputMessage, blabWord);
		return msgInfo;
	}
};
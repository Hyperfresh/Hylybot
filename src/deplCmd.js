const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, BOT_TOKEN } = require('../data/config');

const commands = [];
const commandFiles = fs.readdirSync('/Users/hyperfresh/Documents/GitHub/Hylybot/build/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`/Users/hyperfresh/Documents/GitHub/Hylybot/build/commands/${file}`);
	commands.push(command.run.data.toJSON());
	console.log(`Pushing ${file}.`)
}

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Completed.'))
	.catch(console.error);
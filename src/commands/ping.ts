import { SlashCommandBuilder } from '@discordjs/builders';
import { exec } from "child_process"
import { stderr, stdout } from 'process';

module.exports.run = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!')
    .addStringOption(option => 
        option.setName("url")
        .setDescription("Check the ping between Hyla's server and a website.")
        .setRequired(false)),
    async execute(interaction) {
        if (interaction.options.getString("url")) {
            exec(`ping -c 1 ${interaction.options.getString("url")}`, (err, stdout, stderr) => {
                if (err || stderr) interaction.reply("Your URL was invalid.")
                else interaction.reply(stdout)
            })
        } else {
            await interaction.reply('Pong!')
        }
    }
} 

module.exports.help = {
    name: "ping",
    usage: "/ping [site to ping]",
    desc: "Get the time it takes to get between you, Hyla's server and an optional website."
}
import { SlashCommandBuilder } from '@discordjs/builders';
import { exec } from "child_process"
import { CommandInteraction } from 'discord.js';

module.exports.run = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check how long it takes for the bot to respond to you or another website.')
    .addStringOption(option => 
        option.setName("url")
        .setDescription("(Optional) Enter a URL to check the ping between Hyla's server and the website.")
        .setRequired(false)),
    async execute(interaction: CommandInteraction) {
        if (interaction.options.getString("url")) {
            await interaction.deferReply()
            exec(`ping -c 4 ${interaction.options.getString("url")}`, (err, stdout, stderr) => {
                if (err || stderr) interaction.editReply({ content: "Your URL was invalid." })
                else interaction.editReply({ content: `\`\`\`${stdout}\`\`\``})
            })
        } else {
            await interaction.reply(`Pong! I took ${Math.ceil(interaction.client.ws.ping)}ms.`)
        }
    }
} 

module.exports.help = {
    name: "ping",
    usage: "/ping [site to ping]",
    desc: "Get the time it takes to get between you, Hyla's server and an optional website."
}
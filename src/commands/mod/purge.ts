import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ModAction } from "../../helpers/mod-helper";

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purge messages from the current channel.")
        .addIntegerOption(opt => opt.setName("amount").setDescription("How many messages to remove?").setMinValue(1).setRequired(true)),

    async execute(interaction: CommandInteraction) {
        let count = interaction.options.getInteger("amount")
        ModAction.purge(interaction, count)
    }
}

module.exports.help = {
    name: "purge",
    desc: "purge messages from the current channel"
}
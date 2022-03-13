import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Db } from "mongodb";
import * as badgeHelper from "../../helpers/profile-badge-helper"

// Shows pride badges.

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("badges")
        .setDescription("View pride badges of a user")
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("Which user did you want to view?")
            .setRequired(false)),
    async execute(interaction: CommandInteraction, db: Db) {
        // Check if a user was supplied. If none, use the one who invoked this command
        let user = interaction.options.getUser("user")
        if (!user) user = interaction.user

        await interaction.deferReply()
        // Search on the database for the user
        let search = await db.collection("profiles").findOne({ user: user.id });
        if (!search) {
            interaction.editReply("This user has not assigned any pride badges.")
            if (interaction.user == user) await interaction.followUp({content: "To assign pride badges, run `/profile edit badges`.", ephemeral: true})
            return
        }

        // Create pride badges and edit the reply
        let badges = await badgeHelper.spaceout(
            await badgeHelper.createPrideBadges(search.pride)
          );

        if (badges == null) {
            interaction.editReply("This user has not assigned any pride badges.")
            if (interaction.user == user) await interaction.followUp({content: "To assign pride badges, run `/profile edit badges`.", ephemeral: true})
            return
        }

        let embed = new MessageEmbed()
        .setDescription(`**${user.username}**'s pride badges`)

        interaction.editReply({content: badges, embeds: [embed]})
    }
}

module.exports.help = {
    name: "badges",
    desc: "view pride badges"
}
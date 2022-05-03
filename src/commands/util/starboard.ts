import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v10";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Db } from "mongodb";
import Bot from "../../Bot";

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("starboard")
        .setDescription("Starboard functions.")
        .addSubcommand((sub) =>
            sub
                .setName("stats")
                .setDescription("Show starboard statistics.")
                .addUserOption((opt) =>
                    opt
                        .setName("user")
                        .setDescription(
                            "(Optional) Check starboard statistics for a specific user."
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("view")
                .setDescription("View a (random) starred message.")
                .addStringOption((opt) =>
                    opt
                        .setName("item")
                        .setDescription("(Optional) Provide a starred message ID.")
                        .setRequired(false)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("channel")
                .setDescription("Set starboard channel.")
                .addChannelOption((opt) =>
                    opt
                        .setName("dest")
                        .setDescription("Which channel?")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("lock")
                .setDescription("Lock or unlock the starboard.")
                .addBooleanOption((opt) =>
                    opt
                        .setName("active")
                        .setDescription("Lock the starboard?")
                        .setRequired(true)
                )
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        let command = interaction.options.getSubcommand();
        switch (command) {
            case "stats":
                const starboard = Bot.starboardManager.starboards.find(
                    (s) => s.guildId === interaction.guild.id && s.options.emoji === "⭐",
                );
                if (!starboard) return interaction.reply({ content: "Seems I'm unable to retrieve the starboard at the moment.", ephemeral: true });

                const lb = await starboard.leaderboard();

                const content = lb.map(
                    (m, i) =>
                        `**${i + 1}.**     ${m.stars} ⭐  -  ${m.embeds[0].description || `[Image](${m.embeds[0].image.url})`}`,
                );
                if (!content) return interaction.reply({ content: "There's nothing on the starboard.", ephemeral: true });
                const leaderboard = new MessageEmbed()
                    .setTitle(`${interaction.guild.name} Starboard`)
                    .setDescription(content.join("\n"))
                    .setFooter({ text: "Only shows the top 10 of the 100 most recent stars." });
                interaction.reply({ embeds: [leaderboard] });
                break;
            case "view":
            case "lock":
                await interaction.reply({
                    content: "This feature is under development.",
                    ephemeral: true,
                });
                break;
            case "channel":
                await interaction.deferReply({ ephemeral: true });
                if (!Bot.config.OWNER_ID.includes(interaction.user.id))
                    return interaction.editReply(
                        "You are not permitted to run this command."
                    );
                let cn: any = interaction.options.getChannel("dest");
                try {
                    Bot.starboardManager.create(cn);
                    interaction.editReply(`Channel set to <#${cn.id}>.`);
                } catch (err) {
                    console.error(err.stack);
                    interaction.editReply(`An error occurred. ${err.message}`);
                }
                break;
        }
    },
};

module.exports.help = {
    name: "starboard",
};

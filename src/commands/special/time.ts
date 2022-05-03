import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    EmbedFieldData,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    User,
} from "discord.js";
import { DateTime } from "luxon";
import { Db } from "mongodb";

import timezone from "moment-timezone";

const timezoneButton = new MessageActionRow().addComponents(
    new MessageButton()
        .setLabel("View valid time zones")
        .setURL("https://en.wikipedia.org/wiki/List_of_tz_database_time_zones")
        .setStyle("LINK")
);

export class TimeConvert {
    static async parseTime(time: string, tz?: string): Promise<DateTime> {
        let conv: DateTime = null;
        let formats = ["t", "h:mma", "T", "Hmm"];
        console.log(`Attempting to parse time format ${time}...`);
        formats.forEach((item) => {
            try {
                conv = DateTime.fromFormat(`${time}`, item, { zone: tz });
            } catch (err) {
                console.log(`Probably not format ${item}, got error ${err}`);
            }
        });
        if (!conv) throw Error("Unable to parse given time");
        return conv;
    }

    static async compareWorld(db: Db, time?: string, timezone?: string): Promise<MessageEmbed> {
        let conv: DateTime = null;
        let em = new MessageEmbed();
        if (time) {
            conv = await TimeConvert.parseTime(time, timezone).catch((err) => {
                throw Error(err);
            });
        } else {
            conv = DateTime.now();
        }
        let result = await db
            .collection("profiles")
            .find({ timezone: { $not: { $eq: null } } })
            .toArray();

        let tz: Array<string> = [];
        result.forEach((item) => {
            if (!tz.includes(item.timezone)) tz.push(item.timezone);
        });
        let ar: Array<EmbedFieldData> = [];
        tz.forEach((item) => {
            ar.push({ name: item, value: conv.setZone(item).toFormat("d MMMM y T"), inline: true });
        });
        em.setTitle(`**<t:${conv.toSeconds().toFixed(0)}:f>** for you is...`)
            .addFields(ar)
            .setFooter({
                text: "Is your timezone not on this list? Make sure you've registered your timezone with /profile register timezone.",
            });
        return em;
    }

    static async compareUser(
        user: User,
        db: Db,
        time: string
    ): Promise<MessageEmbed> {
        let conv: DateTime;
        let em = new MessageEmbed();
        let result = await db.collection("profiles").findOne({ user: user.id });
        if (!result || result.timezone == null)
            throw Error("Target user has no time zone set");
        conv = (await TimeConvert.parseTime(time, result.timezone));
        em.setAuthor({ name: conv.toFormat("d MMMM y T (ZZZZZ)") }).setTitle(
            `> ➡ **<t:${conv.toSeconds().toFixed(0)}:f>**`
        );
        return em;
    }
}

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("time")
        .setDescription("Find the time of a user or a timezone.")
        .addSubcommand((sub) =>
            sub
                .setName("world")
                .setDescription("Compare times around the world.")
                .addIntegerOption((opt) =>
                    opt
                        .setName("time")
                        .setDescription(
                            "(Optional) YOUR time that you want to compare, in 24 hour time. Exclude the semicolon."
                        )
                        .setMinValue(0)
                        .setMaxValue(2359)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("compare")
                .setDescription("Compare someone else's time with your time.")
                .addUserOption((opt) =>
                    opt
                        .setName("who")
                        .setDescription("Which user's time did you want to compare?")
                        .setRequired(true)
                )
                .addIntegerOption((opt) =>
                    opt
                        .setName("time")
                        .setDescription(
                            "THE USER's time that you want to compare, in 24 hour time. Exclude the semicolon."
                        )
                        .setMinValue(0)
                        .setMaxValue(2359)
                        .setRequired(true)
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName("user")
                .setDescription("Find the time of a user.")
                .addUserOption((option) =>
                    option.setName("who").setDescription("Which user?").setRequired(true)
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName("timezone")
                .setDescription("Find the time of a timezone.")
                .addStringOption((option) =>
                    option
                        .setName("where")
                        .setDescription("Which timezone? Must be in tz format.")
                        .setRequired(true)
                )
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        let user: User;
        let result: any;
        let time: any;
        let em: MessageEmbed;
        switch (interaction.options.getSubcommand()) {
            case "user":
                await interaction.deferReply();
                user = interaction.options.getUser("who");
                if (!user) user = interaction.user;
                result = await db.collection("profiles").findOne({ user: user.id });
                if (!result || result.timezone == null) {
                    interaction.editReply("This user doesn't have a time zone set.");
                    if (user.id == interaction.user.id)
                        await interaction.followUp({
                            content:
                                "To register your timezone, use `/profile edit timezone`.",
                            ephemeral: true,
                        });
                    return;
                }
                return interaction.editReply(
                    `**${user.username}**'s time is ${DateTime.now()
                        .setZone(result.timezone)
                        .toLocaleString(DateTime.DATETIME_MED)}. (tz \`${result.timezone
                    }\`)`
                );
            case "timezone":
                let value = interaction.options.getString("where");
                if (!timezone.tz.zone(value)) {
                    return interaction.reply({
                        content: `I don't recognize the time zone **tz \`${value}\`**. Please note that **tz** strings are case sensitive.`,
                        components: [timezoneButton],
                        ephemeral: true,
                    });
                }
                return interaction.reply(
                    `The time in **tz \`${value}\`** is ${DateTime.now()
                        .setZone(value)
                        .toLocaleString(DateTime.DATETIME_MED)}.`
                );
            case "compare":
                await interaction.deferReply();
                user = interaction.options.getUser("who");
                time = interaction.options.getInteger("time").toString();
                try {
                    em = await TimeConvert.compareUser(user, db, time);
                } catch (err) {
                    return interaction.editReply({
                        content: `**An error occurred**: ${err}`,
                    });
                }
                return interaction.editReply({ embeds: [em] });
            case "world":
                await interaction.deferReply();
                time = interaction.options.getInteger("time");
                if (time) result = await db.collection("profiles").findOne({ user: interaction.user.id });
                try {
                    em = await TimeConvert.compareWorld(db, time, (result.timezone ? result.timezone : "GMT"));
                } catch (err) {
                    return interaction.editReply({
                        content: `**An error occurred**: ${err}`,
                    });
                }
                return interaction.editReply({ embeds: [em] });
        }
    },
};

module.exports.help = {
    name: "time",
    desc: "Find the time of a user or a timezone.",
};

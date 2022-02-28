import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User,
} from "discord.js";
import { DateTime } from "luxon";
import { Db } from "mongodb";

import * as timezone from "moment-timezone";
import { isArray } from "util";

const timezoneButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("View valid time zones")
    .setURL("https://en.wikipedia.org/wiki/List_of_tz_database_time_zones")
    .setStyle("LINK")
);

const timeFormatButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Learn more about ISO 8601 format")
    .setURL("https://en.wikipedia.org/wiki/ISO_8601")
    .setStyle("LINK")
);

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Find the time of a user or a timezone.")
    .addSubcommand((sub) =>
      sub
        .setName("compare")
        .setDescription("Compare your time with another user.")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Optional user to compare to.")
        )
        .addStringOption((opt) =>
          opt
            .setName("time")
            .setDescription(
              'The time to compare in format "d/m/yyyy, h:mm am/pm". If none given, I\'ll use your current time.'
            )
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("user")
        .setDescription("Find the time of a user.")
        .addUserOption((option) =>
          option.setName("who").setDescription("Which user?")
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
        interaction.editReply(
          `**${user.username}**'s time is ${DateTime.now()
            .setZone(result.timezone)
            .toLocaleString(DateTime.DATETIME_MED)}. (tz \`${
            result.timezone
          }\`)`
        );
        break;
      case "timezone":
        let value = interaction.options.getString("where");
        if (!timezone.tz.zone(value)) {
          return interaction.reply({
            content: `I don't recognize the time zone **tz \`${value}\`**. Please note that **tz** strings are case sensitive.`,
            components: [timezoneButton],
            ephemeral: true,
          });
        }
        interaction.reply(
          `The time in **tz \`${value}\`** is ${DateTime.now()
            .setZone(value)
            .toLocaleString(DateTime.DATETIME_MED)}.`
        );
        break;
      case "compare":
        await interaction.deferReply();
        let auth = await db.collection("profiles").findOne({ user: interaction.user.id });
        if (!auth) {
          interaction.deleteReply();
          if (user.id == interaction.user.id)
            await interaction.followUp({
              content:
                "Please register your timezone first with `/profile edit timezone`.",
              ephemeral: true,
            });
          return;
        }

        user = interaction.options.getUser("user");
        if (user) {
          result = await db.collection("profiles").findOne({ user: user.id });
          if (!result || result.timezone == null) {
            return interaction.editReply(
              "This user doesn't have a time zone set."
            );
          }
        } else
          result = await db
            .collection("profiles")
            .find({ timezone: { $not: { $eq: null } } })
            .toArray();

        let providedTime = interaction.options.getString("time");
        let time: DateTime;

        if (providedTime) {
          try {
            time = DateTime.fromFormat(providedTime, "d/L/y t", {zone: auth.timezone});
          } catch {
            return interaction.editReply(
              'This time is invalid. Make sure it is in format "d/m/yyyy, h:mm am/pm".'
            );
          }
        } else {
          time = DateTime.now();
        }

        let em = new MessageEmbed();
        if (result instanceof Array) {
          let tz: Array<string> = [];
          result.forEach((item) => {
            if (!tz.includes(item.timezone)) tz.push(item.timezone);
          });
          let ar: Array<string> = [];
          tz.forEach((item) => {
            ar.push(
              `**${item}**: ${time.setZone(item).toFormat("d MMMM y t")}`
            );
          });
          em.setTitle(
            `**${time.setZone(auth.timezone).toFormat("d MMMM y t")}** for ${interaction.user.username} is...`
          ).setDescription(ar.join("\n"))
          .setFooter({text: "Is your timezone not on this list? Make sure you've registered your timezone with /profile register timezone."});
        } else {
          em.setTitle(
            `**${time.setZone(auth.timezone).toFormat("d MMMM y t")}** for ${interaction.user.username} is...`
          ).setDescription(
            `**${time.setZone(result.timezone).toFormat("d MMMM y t")}** for <@!${
              user.id
            }>.`
          );
        }
        return interaction.editReply({ embeds: [em] });
    }
  },
};

module.exports.help = {
  name: "time",
  desc: "Find the time of a user or a timezone.",
};

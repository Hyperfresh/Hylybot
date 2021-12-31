import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { DateTime } from "luxon";
import { Db } from "mongodb";

import * as timezone from "moment-timezone"

const timezoneButton = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("View valid time zones")
      .setURL("https://en.wikipedia.org/wiki/List_of_tz_database_time_zones")
      .setStyle("LINK")
  );

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Find the time of a user or a timezone.")
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
    await interaction.deferReply();
    if (interaction.options.getSubcommand() == "user") {
      let user = interaction.options.getUser("who");
      if (!user) user = interaction.user;
      let result = await db.collection("profiles").findOne({ user: user.id });
      if (!result || result.timezone == null) {
        interaction.editReply("This user doesn't have a time zone set.");
        if (user.id == interaction.user.id)
          interaction.followUp({
            content: "To register your timezone, use `/profile edit timezone`.",
            ephemeral: true,
          });
        return;
      }
      let nameResult: string = result.name;
      let nameArray: Array<string> = nameResult.split(" ");
      interaction.editReply(`**${nameArray[0]}**'s time is ${DateTime.now().setZone(result.timezone).toLocaleString(DateTime.DATETIME_MED)}. (tz \`${result.timezone}\`)`)
    } else { // Assume timezone
        let value = interaction.options.getString("where")
        if (!timezone.tz.zone(value)) {
            interaction.editReply({
                content: `I don't recognize the time zone **tz \`${value}\`**. Please note that **tz** strings are case sensitive.`,
                components: [timezoneButton],
              });
              return;
        }
        interaction.editReply(`The time in **tz \`${value}\`** is ${DateTime.now().setZone(value).toLocaleString(DateTime.DATETIME_MED)}.`)
    }
  },
};

module.exports.help = {
  name: "time",
  desc: "Find the time of a user or a timezone.",
};

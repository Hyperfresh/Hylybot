import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DateTime, Duration } from "luxon";
import { Db } from "mongodb";

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("View your birthday, or someone else's.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Whose birthday do you want to check?")
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction, db: Db) {
    await interaction.deferReply();
    let user = interaction.options.getUser("user");
    if (!user) user = interaction.user;
    let result = await db.collection("profiles").findOne({ user: user.id });
    if (!result || result.bday == "Unknown") {
      interaction.editReply("This user hasn't registered their birthday.");
      if (user.id == interaction.user.id)
        interaction.followUp({
          content: "To register your birthday, use `/profile edit bday`.",
          ephemeral: true,
        });
      return;
    }
    let nameResult: string = result.name;
    let nameArray: Array<string> = nameResult.split(" ");
    let bdayResult: string = result.bday;
    let bdayArray: Array<string> = bdayResult.split(" ");
    let now = DateTime.now();
    let bdayParse: string;
    if (now.monthShort == "Dec" && bdayArray[1] != "Dec")
      bdayParse = `${bdayArray[0]} ${bdayArray[1]} ${now.year + 1}`;
    else bdayParse = `${bdayArray[0]} ${bdayArray[1]} ${now.year}`;
    let bday = DateTime.fromFormat(bdayParse, "d LLL yyyy");
    let length = bday.diff(now);
    let birthday;
    console.log(bdayParse, bday, length);
    if (length.toMillis() <= 604800000) {
      let remain;
      if (length.toMillis() <= 86400000) {
        remain = length.toFormat("h m");
        let split: Array<string> = remain.split(" ");
        birthday = `is in ${split[0]} hours and ${split[1]} minutes!`;
      } else {
        remain = length.toFormat("d h m");
        let split: Array<string> = remain.split(" ");
        birthday = `is in ${split[0]} days, ${split[1]} hours and ${split[2]} minutes!`;
      }
    }
    if (length.toMillis() < 0 && length.toMillis() >= -604800000) {
      let remain;
      if (length.toMillis() >= -86400000) {
        birthday = `is today!`;
      } else {
        remain = length.toFormat("d h m");
        let split: Array<number> = remain.split(" ");
        birthday = `was ${split[0] * -1} days, ${split[1] * -1} hours and ${
          split[2] * -1
        } minutes ago.`;
      }
    }

    if (!birthday) birthday = `is on ${bday.toFormat("dd LLL")}.`;
    interaction.editReply(`**${nameArray[0]}**'s birthday ${birthday}`);
  },
};

module.exports.help = {
  name: "birthday",
  desc: "View your birthday, or someone else's.",
};

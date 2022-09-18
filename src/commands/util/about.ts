import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { displayBotDetails } from "../../helpers/aboutHelper";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription(
      "View information about Hylybot and the Hyla + Friends server"
    )
    .addStringOption((opt) =>
      opt
        .setName("what")
        .setDescription("What do you want to find out about?")
        .setRequired(true)
        .addChoices(
            { name: "About Hylybot", value: "bot" },
            { name: "About Hyla + Friends", value: "server" },
        )
    ),
  async execute(interaction: CommandInteraction) {
    let val = interaction.options.get("what")?.value
    
    interaction.reply({embeds: [displayBotDetails(interaction.client)]})
  }
};

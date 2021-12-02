import { SlashCommandBuilder } from "@discordjs/builders";
import { exec } from "child_process";
// import ready from "../events/ready"
let config = require("../../data/config");

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Bot owner command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Command to send to bot")
        .setRequired(true)
        .addChoice("Stop", "stop")
        .addChoice("Reboot", "reboot")
        .addChoice("Update Git", "git")
        .addChoice("Update NPM", "npm")
    ),
  async execute(interaction) {
    if (!config.OWNER_ID.includes(interaction.user.id)) {
      interaction.reply({
        content: `Nice try, ${interaction.user.username}...`,
        ephemeral: true,
      });
      console.warn(
        `Seems ${interaction.user.tag} was trying to interact with the bot's controls...`
      );
      return;
    }
    switch (interaction.options.getString("command")) {
      case "stop":
        await interaction.reply("🛑 > Shutting down.");
        await interaction.client.user.setStatus("invisible");
        setTimeout(() => {
          interaction.client.destroy();
          process.exit();
        }, 3000);
        break;
      case "reboot":
        interaction.reply({
          content:
            "This is not implemented. It's better if you do a full shutdown then start the program again.",
          ephemeral: true,
        });
        break;
      case "npm":
        interaction.deferReply({ ephemeral: true });
        exec(`npm i ; npm ci ; npm audit`, (err, stdout, stderr) => {
          if (err || stderr)
            interaction.editReply({
              content: `An error occurred. \`\`\`Err: ${err}\n---\nStdrr: ${stderr}\`\`\``,
              ephemeral: true,
            });
          else
            interaction.editReply({
              content: `\`\`\`${stdout}\`\`\``,
              ephemeral: true,
            });
        });
        break;
    case "git":
        interaction.deferReply({ ephemeral: true });
        exec(`git reset --hard ; git fetch --all ; git pull`, (err, stdout, stderr) => {
          if (err || stderr)
            interaction.editReply({
              content: `An error occurred. \`\`\`Err: ${err}\n---\nStdrr: ${stderr}\`\`\``,
              ephemeral: true,
            });
          else
            interaction.editReply({
              content: `\`\`\`${stdout}\`\`\``,
              ephemeral: true,
            });
        });
        break;
    }
  },
};

module.exports.help = {
    name: "bot",
    usage: "/bot <Stop/Reboot/Update Git/Update NPM>",
    desc: "Bot owner command only."
}
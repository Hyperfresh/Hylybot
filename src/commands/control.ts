import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
let config = require("../../data/config");

import { Bash } from "node-bash";
import { PowerShell } from "node-powershell";

async function looseJsonParse(obj) {
  let test;
  try {
    test = await Function('"use strict";return (' + obj + ")")();
  } catch (err) {
    test = err;
  }
  return test;
}

async function executeShell(cmd) {
  const ps = new Bash({
    debug: true,
    executableOptions: {
      "--noprofile": true,
    },
  });
  let result;
  try {
    result = await ps.invoke(cmd);
  } catch (err) {
    await ps.dispose();
    console.log(err);
    return err;
  }
  await ps.dispose();
  console.log(await result);
  return result.raw;
}

async function executePwsh(cmd) {
  const ps = new PowerShell({
    debug: true,
    executableOptions: {
      "-ExecutionPolicy": "Bypass",
      "-NoProfile": true,
    },
  });
  let result;
  try {
    result = await ps.invoke(cmd);
  } catch (err) {
    await ps.dispose();
    console.log(err);
    return err;
  }
  await ps.dispose();
  console.log(await result);
  return result.raw;
}

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Bot owner command.")
    .addSubcommand((sub) =>
      sub.setName("stop").setDescription("Bot owner command.")
    )
    .addSubcommand((sub) =>
      sub
        .setName("eval")
        .setDescription("Bot owner command.")
        .addStringOption((opt) =>
          opt
            .setName("method")
            .setDescription("What eval method?")
            .setRequired(true)
            .addChoice("Node", "js")
            .addChoice("Bash", "sh")
            .addChoice("Pwsh", "pw")
        )
        .addStringOption((opt) =>
          opt
            .setName("data")
            .setDescription("String to evaluate.")
            .setRequired(true)
        )
    ),
  async execute(interaction: CommandInteraction) {
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
    switch (interaction.options.getSubcommand()) {
      case "stop":
        await interaction.reply("🛑 > Shutting down.");
        interaction.client.user.setStatus("invisible");
        setTimeout(() => {
          interaction.client.destroy();
          process.exit();
        }, 3000);
        break;
      case "eval":
        await interaction.deferReply({ ephemeral: true });
        let data = interaction.options.getString("data");
        switch (interaction.options.getString("method")) {
          case "js":
            interaction.editReply(
              `Saw:\n\`\`\`js\n${data}\`\`\` Got:\n\`\`\`js\n${await looseJsonParse(
                data
              )}\`\`\``
            );
            break;
          case "sh":
            interaction.editReply(
              `Saw:\n\`\`\`sh\n${data}\`\`\` Got:\n\`\`\`sh\n${await executeShell(
                data
              )}\`\`\``
            );
            break;
          case "pw":
            interaction.editReply(
              `Saw:\n\`\`\`ps\n${data}\`\`\` Got:\n\`\`\`ps\n${await executePwsh(
                data
              )}\`\`\``
            );
            break;
        }
        break;
      default:
        throw new Error();
    }
  },
};

module.exports.help = {
  name: "bot",
  usage: "/bot",
  desc: "Bot owner command only.",
};

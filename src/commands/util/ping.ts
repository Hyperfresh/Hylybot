import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { promise, PingResponse } from "ping";

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "Check how long it takes for the bot to respond to you or another website."
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription(
          "(Optional) Enter a URL to check the ping between Hyla's server and the website."
        )
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    let url = interaction.options.getString("url");
    if (url) {
      await interaction.deferReply();
      promise.probe(url).then((res: PingResponse) => {
        let msg = res.alive
          ? `\`${res.host}\` responded after ${res.time} ms.`
          : `\`${res.host}\` didn't respond.`;
        interaction.editReply(msg);
      });
    } else {
      await interaction.reply(
        `> **Pong!**\n🏓 **Latency**: ${
          Date.now() - interaction.createdTimestamp
        }\n🔌 **Socket**: ${Math.ceil(interaction.client.ws.ping)}ms`
      );
    }
  },
};

module.exports.help = {
  name: "ping",
  usage: "/ping [site to ping]",
  desc: "Get the time it takes to get between you, Hyla's server and an optional website.",
};

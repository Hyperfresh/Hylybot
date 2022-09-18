import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { promise, PingResponse } from "ping";

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(
            "Check how long it takes for the bot to respond to you or another website."
        )
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    let url = interaction.options.get("url")?.value
    if (typeof url == "string") {
      await interaction.deferReply();
      promise.probe(url).then((res: PingResponse) => {
        let msg = res.alive
          ? `\`${res.host}\` responded after ${res.time} ms.`
          : `\`${res.host}\` didn't respond.`;
        interaction.editReply(msg);
      })
      .catch((err) => interaction.editReply(`An error occurred: \`${err}\``))
    } else {
      await interaction.reply(
        `> **Pong!**\n🏓 **Latency**: ${
          Date.now() - interaction.createdTimestamp
        }ms\n🔌 **Socket**: ${Math.ceil(interaction.client.ws.ping)}ms`
      );
    }
  },
};

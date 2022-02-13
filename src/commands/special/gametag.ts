import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, User } from "discord.js";
import { Db } from "mongodb";

import {
  parseMinecraft,
  updateMinecraft,
} from "../../helpers/minecraft-helper";

function notThere(interaction: CommandInteraction, user: User) {
  interaction.editReply("This user hasn't registered this gametag.");
  if (user.id == interaction.user.id)
    interaction.followUp({
      content: "To register this gametag, use `/profile edit gametag`.",
      ephemeral: true,
    });
}

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("gametag")
    .setDescription("View a tag for a game or console.")
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Which tag do you want to look at?")
        .setRequired(true)
        .addChoice("Nintendo Switch", "switch")
        .addChoice("Fortnite", "fortnite")
        .addChoice("Genshin Impact", "genshin")
        .addChoice("Nintendo Switch", "switch")
        .addChoice("Minecraft", "mc")
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to check?")
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction, db: Db) {
    await interaction.deferReply();
    let user = interaction.options.getUser("user");
    if (!user) user = interaction.user;
    let result = await db.collection("profiles").findOne({ user: user.id });
    if (!result) {
      notThere(interaction, user);
      return;
    }
    switch (interaction.options.getString("tag")) {
      case "genshin":
        if (!result.gametags.genshin) {
          notThere(interaction, user);
          return;
        }
        interaction.editReply(
          `**${user.username}**'s Genshin Impact UID is \`${result.gametags.genshin}\``
        );
        break;
      case "fortnite":
        if (!result.gametags.fortnite) {
          notThere(interaction, user);
          return;
        }
        interaction.editReply(
          `**${user.username}**'s Fortnite username is \`${result.gametags.fortnite}\``
        );
        break;
      case "switch":
        if (!result.gametags.switch) {
          notThere(interaction, user);
          return;
        }
        interaction.editReply(
          `**${user.username}**'s Switch FC is \`${result.gametags.switch}\``
        );
        break;
      case "mc":
        let minecraft: string;
        if (!result.gametags.mc) {
          let res = await updateMinecraft(db, result.user);
          if (res == -1) minecraft = "Unknown";
        } else {
          minecraft = await parseMinecraft(result.gametags.mc);
        }
        if (!minecraft)
          interaction.editReply(
            "It seems the user's Minecraft account details have been updated. Run this command again to see the username."
          );
        else if (minecraft == "Unknown")
          interaction.editReply(
            "This user's Minecraft account hasn't been linked. [Click here for more information.](https://contact.hyperfre.sh/minecraft)"
          );
        else
          interaction.editReply(
            `**${user.username}**'s Minecraft username is ${minecraft}`
          );
        break;
    }
  },
};

module.exports.help = {
  name: "gametag",
  desc: "View gametags",
};

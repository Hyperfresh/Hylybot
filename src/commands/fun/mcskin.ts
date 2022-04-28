import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { Db } from "mongodb";
import {
  updateMinecraft,
  parseMinecraft,
} from "../../helpers/minecraft-helper";

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("mcskin")
    .setDescription("View someone's Minecraft skin.")
    .addUserOption((opt) =>
      opt
        .setName("who")
        .setDescription(
          "The user must have joined the Minecraft server for this to work! [Default: yourself]"
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription(
          "What part of the skin would you like to see? [Default: body]"
        )
        .addChoices(
          {name: "Avatar", value: "avatars"},
          {name: "Head", value: "head"},
          {name: "Body", value: "body"},
          {name: "Bust", value: "bust"},
          {name: "Skin", value: "skins"},
        )
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction, db: Db) {
    await interaction.deferReply();
    let user: User = interaction.options.getUser("who")
      ? interaction.options.getUser("who")
      : interaction.user;
    let skin: string = interaction.options.getString("type")
      ? interaction.options.getString("type")
      : "body";

    let res: any = await db.collection("profiles").findOne({ user: user.id });
    if (!res)
      return interaction.editReply(
        "This user must set up a Server Profile first."
      );

    let minecraft: string = "";
    if (!res.gametags.mc) {
      let resMC = await updateMinecraft(db, user.id);
      if (resMC == -1) minecraft = "Unknown";
    } else {
      minecraft = await parseMinecraft(res.gametags.mc, true);
    }
    if (!minecraft)
      return interaction.editReply(
        "It seems the user's Minecraft account details have been updated. Run this command again to see the username."
      );
    if (minecraft == "Unknown")
      return interaction.editReply(
        "This user's Minecraft account hasn't been linked. [Click here for more information.](https://contact.hyperfre.sh/minecraft)"
      );

    let embed: MessageEmbed = new MessageEmbed();
    if (skin == "head" || skin == "bust") {
      embed
        .setTitle(`${minecraft}'s ${skin}`)
        .setImage(
          `https://visage.surgeplay.com/${skin}/${res.gametags.mc}.png`
        )
        .setFooter({ text: "3D renders powered by Visage - https://visage.surgeplay.com/" });
    } else if (skin == "body") {
        embed
        .setTitle(`${minecraft}'s body`)
        .setImage(
          `https://visage.surgeplay.com/full/${res.gametags.mc}.png`
        )
        .setFooter({ text: "3D renders powered by Visage - https://visage.surgeplay.com/" });
    } else {
        embed.setTitle(`${minecraft}'s ${skin}`)
        .setImage(`https://crafatar.com/${skin}/${res.gametags.mc}.png?size=512&overlay`)
        .setFooter({ text: "2D images powered by Crafatar - https://crafatar.com" });
    }
    return interaction.editReply({embeds: [embed]})
  },
};

module.exports.help = {
    name: "mcskin",
    desc: "NYI"
}
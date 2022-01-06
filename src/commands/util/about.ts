import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import { Duration } from "luxon";
import {
  arch,
  cpus,
  freemem,
  platform,
  release,
  totalmem,
  uptime,
  version,
} from "os";
import { memoryUsage } from "process";
import * as typescript from "typescript";

async function aboutBot(client: Discord.Client) {
  await client.user.fetch(true);

  let SUT = Duration.fromMillis(uptime() * 1000).toFormat("d h m s");
  let SUT_string = SUT.split(" ");
  let USED_MEM = ((totalmem() - freemem()) / 1e8).toFixed(2);
  let TOTAL_MEM = (totalmem() / 1e8).toFixed(2);

  let CUT = Duration.fromMillis(client.uptime * 1000).toFormat("d h m s");
  let CUT_string = CUT.split(" ");
  let USED_HEAP = (memoryUsage().heapUsed / 1e6).toFixed(2);
  let TOTAL_HEAP = (memoryUsage().heapTotal / 1e6).toFixed(2);

  let aboutBotEmbed: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setTitle("Hello, I'm Hylybot!")
    .setThumbnail(client.user.avatarURL({ size: 1024 }))
    .setColor(client.user.accentColor)
    .setDescription(
      `<@!${client.user.id}> is a custom-built Discord bot for the *Hyla + Friends* server, coded in TypeScript.`
    )
    .addField(
      "Server information",
      `> **${platform()} ${release()} ${arch()}**\n*(${version()})*\n\n**CPU**: ${
        cpus()[0].model
      }\n**Memory used**: ${USED_MEM}GB / ${TOTAL_MEM}GB\n**Server uptime**: ${
        SUT_string[0]
      }d ${SUT_string[1]}h ${SUT_string[2]}m ${SUT_string[3]}s`
    )
    .addField(
      "Engine information",
      `> **Discord.js v${Discord.version}**\nw/ Node ${process.version} & TypeScript v${typescript.version}\n\n**Heap used**: ${USED_HEAP}MB / ${TOTAL_HEAP}MB\n**Bot uptime**: ${CUT_string[0]}d ${CUT_string[1]}h ${CUT_string[2]}m ${CUT_string[3]}s`
    )
    .setFooter(
      "Created by @Hyperfresh#8080",
      "https://media.discordapp.net/attachments/634575479042474003/663591393754742794/emote.gif"
    );

  return aboutBotEmbed;
}

async function aboutServer(guild: Discord.Guild) {
  let aboutServerEmbed: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL({ size: 1024 }))
    .setDescription(
      `> **Since ${guild.createdAt}**\nHome to **${guild.memberCount} members**, *Hyla + Friends* is where Hyla and mo friends hang out, play games and talk about whatever mo friends feel like talking about!\n\n<:ally:916128799479955467> <:nd:798918686676353034> *The server is an inclusive safe space for all its members, ensuring our most vulnerable feel protected and welcome.*`
    )
    .addField("Owners", "<@!352668050111201291>\n<@!758614967984848917>", true)
    .addField("Admins", "<@!135598560824524800>\n<@!267828479049859072>", true)
    .addField(
      "Moderators",
      "<@!457350691296641025>\n<@!230209666435514368>",
      true
    );

  return aboutServerEmbed;
}

const aboutRoles: Discord.MessageEmbed = new Discord.MessageEmbed()
  .setTitle("Roles")
  .setDescription(
    "**To set a colour, use the `/role` command.**\nIf you're wishing to be notified about games, set your pronouns or tell people about your hobbies, check the <#908680453366616069> channel."
  );
const aboutProfiles: Discord.MessageEmbed = new Discord.MessageEmbed()
  .setTitle("Server profiles")
  .setDescription(
    "We're pretty big on identity here - because you should be proud of who you are!\nHylybot has a server profile function where you can set your name, (neo)pronouns, pride badges, or even describe what you like and feature some artwork!\nUse the `/profile` command to find out more."
  );

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("View information about the bot or this server.")
    .addStringOption((option) =>
      option
        .setName("what")
        .setDescription("What do you want to find out about?")
        .setRequired(true)
        .addChoice("Discord Bot", "bot")
        .addChoice("Server", "server")
        .addChoice("Roles", "roles")
        .addChoice("Profiles", "profiles")
    ),
  async execute(interaction: Discord.CommandInteraction) {
    switch (interaction.options.getString("what")) {
      case "bot":
        await interaction.reply({
          embeds: [await aboutBot(interaction.client)],
        });
        break;
      case "server":
        await interaction.reply({
          embeds: [await aboutServer(interaction.guild)],
        });
        break;
      case "roles":
        await interaction.reply({ embeds: [aboutRoles] });
        break;
      case "profiles":
        await interaction.reply({ embeds: [aboutProfiles] });
        break;
    }
  },
};

module.exports.help = {
  name: "about",
  desc: "View information about the bot or this server.",
};

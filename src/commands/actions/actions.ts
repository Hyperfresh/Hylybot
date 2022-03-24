import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { DateTime } from "luxon";
import fetch from "node-fetch";
import { config } from "../..";

async function grab(term: string): Promise<any> {
  let gifs = await fetch(
    `https://g.tenor.com/v1/search?q=anime+${term}&key=${config.GIF_KEY}&limit=50`
  )
    .then((res) => res.json())
    .then((data) => {
      return data.results;
    });
  let item = Math.random() * (gifs.length - 1);
  return gifs[item.toFixed(0)];
}

function createMessage(user: User, item: string, target?: User): string {
  let string = "";
  if (target) {
    switch (item) {
      case "hug":
      case "kick":
      case "pat":
      case "slap":
      case "poke":
      case "cuddle":
        string = `<@!${user.id}> ${item}s <@!${target.id}>!`;
        break;
      case "punch":
      case "kiss":
        string = `<@!${user.id}> ${item}es <@!${target.id}>!`;
        break;
      case "wave":
      case "smile":
      case "stare":
      case "laugh":
      case "pout":
        string = `<@!${user.id}> ${item}s at <@!${target.id}>!`;
        break;
      case "cry":
        string = `<@!${user.id}> cries at <@!${target.id}>... :c`;
        break;
      case "sleeping":
        string = `<@!${user.id}> sleeps on <@!${target.id}>... that's cute (. ❛ ᴗ ❛.)`;
        break;
    }
  } else {
    switch (item) {
      case "hug":
      case "pat":
      case "cuddle":
      case "kiss":
      case "wave":
        string = `Have a ${item}, <@!${user.id}> ^u^`;
        break;
      case "poke":
        string = `Hehe, poke-a-boo <@!${user.id}> ´◔‿ゝ◔\`)━☞`;
        break;
      case "punch":
      case "kick":
      case "slap":
        string = `BANG! That's what you get <@!${user.id}>, a well-deserved ${item} D:<`;
        break;
      case "smile":
        string = `<@!${user.id}> is feeling happy ^u^`;
        break;
      case "cry":
        string = `<@!${user.id}> is feeling sad :c`;
        break;
      case "laugh":
      case "stare":
      case "pout":
        string = `Hey <@!${user.id}>, stop ${item}ing at me (@_@;)`;
        break;
      case "sleeping":
        string = `<@!${user.id}> is feeling sleepy...`;
        break;
    }
  }
  return string;
}

let lastRun = DateTime.now();

const cooldownEmbed = new MessageEmbed()
  .setTitle("Hey, slow down!")
  .setDescription(
    `Let's try not clog up our channels with GIFs. Try again later.`
  )
  .setColor("#ff0000")
  .setThumbnail(
    "https://media.discordapp.net/attachments/798903453438050324/931078218792980490/emoji.png"
  );

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("i")
    .setDescription("Do something to someone!")
    .addStringOption((opt) =>
      opt
        .setName("what")
        .setDescription("What action are you doing?")
        .setChoices([
          // [item]s
          ["headpat", "pat"],
          ["kick", "kick"],
          ["slap", "slap"],
          ["poke", "poke"],
          ["cuddle", "cuddle"],
          ["hug", "hug"],

          // [item]es
          ["kiss", "kiss"],
          ["punch", "punch"],

          // [item]s at
          ["wave", "wave"],
          ["stare", "stare"],
          ["smile", "smile"],
          ["laugh", "laugh"],
          ["pout", "pout"],

          // cries at
          ["cry", "cry"],

          // sleeps on
          ["sleep", "sleeping"],
        ])
        .setRequired(true)
    )
    .addUserOption((OPT) =>
      OPT.setName("who")
        .setDescription("(Optional) To who? Or just yourself?")
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    if (lastRun.plus({ minutes: 1 }) > DateTime.now()) {
      return interaction.reply({
        content: "⏳ **Slow down!**",
        embeds: [cooldownEmbed],
        ephemeral: true
      });
    }
    lastRun = DateTime.now();

    await interaction.deferReply();
    let user = interaction.user;
    let targ = interaction.options.getUser("who");
    let item = interaction.options.getString("what");

    let message = createMessage(user, item, targ);
    let gif = await grab(item);
    let embed = new MessageEmbed()
      .setAuthor({
        name: `"${gif.content_description}" via Tenor`,
        url: gif.itemurl,
      })
      .setImage(gif.media[0].gif.url)
      .setColor(gif.bg_color ? gif.bg_color : "GREY");

    interaction.editReply({ content: message, embeds: [embed] });
  },
};

module.exports.help = {
  name: "i",
  usage: "/i <do> <who>",
};

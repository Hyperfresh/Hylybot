// Importing libraries and whatnot
import {
  MessageEmbed,
  Client,
  MessageButton,
  MessageActionRow,
  Guild,
  GuildMember,
} from "discord.js";

import { SlashCommandBuilder } from "@discordjs/builders";

import { DateTime } from "luxon";
import * as timezone from "moment-timezone";

import isImageURL from "image-url-validator";
import minecraftPlayer = require("minecraft-player");

import * as pf from "../../helpers/profile-badge-helper";

import { Db } from "mongodb";

const config = require("../../../data/config");

function getUserFromMention(
  client: Client,
  mention
) /* Make a mention into a snowflake. */ {
  if (!mention) return;
  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);
    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }
    return client.users.cache.get(mention);
  }
}

async function dbSearch(
  db: Db,
  search: string
) /* Search for a user via memberid. */ {
  return await db.collection("profiles").findOne({ _id: search });
}

async function dbUpdate(
  db: Db,
  search: string,
  _field: string,
  content: any
) /* Update details on the database. */ {
  db.collection("profiles").updateOne(
    { _id: search },
    { $set: { _field: content } }
  );
}

async function dbClear(db: Db, search: string, item: string) {
  db.collection("profiles").updateOne({ _id: search }, { $unset: item });
}

// Pride badge buttons
const BadgeButton1 = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("View my current badges")
      .setStyle("PRIMARY")
      .setEmoji("mag")
      .setCustomId("view"),
    new MessageButton()
      .setLabel("Gay")
      .setStyle("SECONDARY")
      .setEmoji("rainbow_flag")
      .setCustomId("gay"),
    new MessageButton()
      .setLabel("Lesbian")
      .setStyle("SECONDARY")
      .setEmoji("915950916606242816")
      .setCustomId("lesbian"),
    new MessageButton()
      .setLabel("Bisexual")
      .setStyle("SECONDARY")
      .setEmoji("915950686661906452")
      .setCustomId("enby"),
    new MessageButton()
      .setLabel("Pansexual")
      .setStyle("SECONDARY")
      .setEmoji("915950724838461490")
  ),
  BadgeButton2 = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("Asexual")
      .setStyle("SECONDARY")
      .setEmoji("915950767649734757")
      .setCustomId("ace"),
    new MessageButton()
      .setLabel("Aromantic")
      .setStyle("SECONDARY")
      .setEmoji("915950829054332959")
      .setCustomId("aro"),
    new MessageButton()
      .setLabel("Transgender")
      .setStyle("SECONDARY")
      .setEmoji("transgender_flag")
      .setCustomId("trans"),
    new MessageButton()
      .setLabel("Non-Binary")
      .setStyle("SECONDARY")
      .setEmoji("915950848121663559")
      .setCustomId("enby"),
    new MessageButton()
      .setLabel("Agender")
      .setStyle("SECONDARY")
      .setEmoji("915950806925213706")
      .setCustomId("agender")
  ),
  BadgeButton3 = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("Genderqueer")
      .setStyle("SECONDARY")
      .setEmoji("915950873098747915")
      .setCustomId("gq"),
    new MessageButton()
      .setLabel("Catgender")
      .setStyle("SECONDARY")
      .setEmoji("916128763203420161")
      .setCustomId("cat"),
    new MessageButton()
      .setLabel("Ally")
      .setStyle("SECONDARY")
      .setEmoji("916128799479955467")
      .setCustomId("ally"),
    new MessageButton()
      .setLabel("Neurodiverse")
      .setStyle("SECONDARY")
      .setEmoji("798918686676353034")
      .setCustomId("nd"),
    new MessageButton()
      .setLabel("Clear my badges")
      .setStyle("DANGER")
      .setEmoji("bomb")
      .setCustomId("clear")
  );

// Colour picker button
const colourButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Use a colour picker")
    .setURL("https://duckduckgo.com/?q=color+picker&ia=answer")
    .setStyle("LINK"),
  new MessageButton()
    .setLabel("View pre-defined colours")
    .setCustomId("preCol")
    .setStyle("SECONDARY")
);

// Timezone button
const timezoneButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("View valid time zones")
    .setURL("https://en.wikipedia.org/wiki/List_of_tz_database_time_zones")
    .setStyle("LINK")
);

// Clear buttons
const gameClearButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Genshin Impact UID")
    .setStyle("SECONDARY")
    .setCustomId("clearGenshin"),
  new MessageButton()
    .setLabel("Nintendo Switch Friend Code")
    .setStyle("SECONDARY")
    .setCustomId("clearFC"),
  new MessageButton()
    .setLabel("Minecraft Username")
    .setStyle("SECONDARY")
    .setCustomId("clearMC"),
  new MessageButton()
    .setLabel("Clear all tags")
    .setStyle("DANGER")
    .setCustomId("clearTag")
);

// Pre-defined colours
const colours = [
  { name: "red", hex: "ff0000" },
  { name: "orange", hex: "e67e22" },
  { name: "yellow", hex: "f1c40f" },
  { name: "purple", hex: "9b59b6" },
  { name: "lime", hex: "2ecc71" },
  { name: "green", hex: "1f8b4c" },
  { name: "aqua", hex: "00d6ff" },
  { name: "blue", hex: "3498db" },
  { name: "darkBlue", hex: "0012c3" },
  { name: "magenta", hex: "ff008f" },
  { name: "pink", hex: "ff7ee7" },
  { name: "white", hex: "ffffff" },
  { name: "black", hex: "000000" },
  { name: "grey", hex: "95a5a6" },
  { name: "ninja", hex: "36393e" },
  { name: "blurpleOld", hex: "7289da" },
  { name: "blurpleNew", hex: "5865f2" },
];

async function createEmbed(
  client: Client,
  r: any,
  user: GuildMember,
  guild: Guild
) /* Create the profile card. */ {
  let time = DateTime.now()
    .setZone(r.timezone)
    .toLocaleString(DateTime.DATETIME_MED);
  console.log(await pf.spaceout(await pf.createInterestBadges(r.ibadges)));
  console.log(r);
  let embed = new MessageEmbed()
    .setTitle(r.username)
    .setColor(r.colour)
    .setDescription(
      `**Name**: ${r.name}\n**Pronouns**: ${r.pronouns}\n**Birthday**: ${r.bday}`
    )
    .setThumbnail(user.avatarURL({ dynamic: true, size: 1024 }))
    .setAuthor("Hyla + Friends Server Profile")
    .addField(
      "Game Badges",
      await pf.spaceout(await pf.createInterestBadges(r.ibadges))
    )
    .addField(
      "Staff Badges",
      await pf.spaceout(await pf.createServerBadges(client, r.memberid, guild)),
      true
    )
    .addField(
      "Pride Badges",
      await pf.spaceout(await pf.createPrideBadges(r.pbadges)),
      true
    )
    .setFooter(`Member ID: ${r.memberid}`);
  if (r.tz !== null)
    embed.addField(
      `The time for me is ${time}.`,
      `**Time zone**: ${r.tz}`,
      false
    );
  if (r.bio !== null) embed.addField(r.bio.title, r.bio.desc, false);
  try {
    if (r.image !== null) embed.setImage(r.image);
  } catch {
    console.log("No bio image!");
  }
  return embed;
}

// Click-to-create embed + button
const setupProfile = new MessageEmbed()
  .setTitle(
    "It looks like you were trying to view your server profile. Can I help?"
  )
  .setDescription(
    "You don't have a server profile on record. If you want to create one, click the button below."
  )
  .setThumbnail(
    "https://images-ext-1.discordapp.net/external/FHD0KFnrmup7P_Pi5SUNKOwoxpnGLKr4JEiU9x5wT_k/https/41dmav17y2a239wj1k1kd0yt-wpengine.netdna-ssl.com/monitor/wp-content/uploads/sites/3/2015/01/clippy-300x278.png"
  );
const setupButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Create server profile")
    .setStyle("PRIMARY")
    .setCustomId("create")
);

// Minecraft deny embed
const setupMinecraft = new MessageEmbed()
  .setTitle(
    "It looks like you're trying to add a Minecraft username to your server profile. Can I help?"
  )
  .setDescription(
    "Your username automatically appears on your profile when you link your Minecraft account to the Discord server.\nFor more information, [click here](https://contact.hyperfre.sh/minecraft)."
  )
  .setThumbnail(
    "https://images-ext-1.discordapp.net/external/FHD0KFnrmup7P_Pi5SUNKOwoxpnGLKr4JEiU9x5wT_k/https/41dmav17y2a239wj1k1kd0yt-wpengine.netdna-ssl.com/monitor/wp-content/uploads/sites/3/2015/01/clippy-300x278.png"
  );
/*
Helpful regex shit
/^([0-9]{9})$/
/^((31(?!\ (Feb(ruary)?|Apr(il)?|June?|(Sep(?=\b|t)t?|Nov)(ember)?)))|((30|29)(?!\ Feb(ruary)?))|(29(?=\ Feb(ruary)?\ (((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)))))|(0?[1-9])|1\d|2[0-8])\ (Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Ju((ly?)|(ne?))|Aug(ust)?|Oct(ober)?|(Sep(?=\b|t)t?|Nov|Dec)(ember)?)$/
/(SW-[0-9]{4}-[0-9]{4}-[0-9]{4})/
*/

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View or edit server profiles.")
    .addSubcommandGroup((group) =>
      group
        .setName("edit")
        .setDescription("Edit your server profile.")
        .addSubcommand(
          // Pride badges
          (subCommand) =>
            subCommand.setName("badges").setDescription("Set pride badges.")
        )
        .addSubcommand(
          // Name
          (subCommand) =>
            subCommand
              .setName("name")
              .setDescription("Set your name.")
              .addStringOption((option) =>
                option
                  .setName("value")
                  .setDescription(
                    "The name you want to display on your profile."
                  )
                  .setRequired(true)
              )
        )
        .addSubcommand(
          // Birthday
          (subCommand) =>
            subCommand
              .setName("birthday")
              .setDescription(
                "Set your birthday (and optionally set your age)."
              )
              .addIntegerOption(
                (
                  option // Day
                ) =>
                  option
                    .setName("day")
                    .setDescription("What day were you born on?")
                    .setRequired(true)
              )
              .addStringOption(
                (
                  option // Month
                ) =>
                  option
                    .setName("month")
                    .setDescription("What month were you born on?")
                    .setRequired(true)
                    .addChoice("January", "Jan")
                    .addChoice("February", "Feb")
                    .addChoice("March", "Mar")
                    .addChoice("April", "Apr")
                    .addChoice("May", "May")
                    .addChoice("June", "Jun")
                    .addChoice("July", "Jul")
                    .addChoice("August", "Aug")
                    .addChoice("September", "Sep")
                    .addChoice("October", "Oct")
                    .addChoice("November", "Nov")
                    .addChoice("December", "Dec")
              )
              .addIntegerOption(
                (
                  option // Age
                ) =>
                  option
                    .setName("age")
                    .setDescription("(Optional) How old are you?")
                    .setRequired(false)
              )
        )
        .addSubcommand(
          // Gametag
          (subCommand) =>
            subCommand
              .setName("gametag")
              .setDescription(
                "Add a tag from a game or console, such as a Nintendo Switch friend code."
              )
              .addStringOption((option) =>
                option
                  .setName("item")
                  .setDescription("Which game or console?")
                  .setRequired(true)
                  .addChoice("Genshin Impact", "genshin")
                  .addChoice("Nintendo Switch", "switch")
                  .addChoice("Minecraft", "mc")
              )
              .addStringOption((option) =>
                option
                  .setName("tag")
                  .setDescription("Your FC or UID goes here.")
                  .setRequired(true)
              )
        )
        .addSubcommand(
          // Bio
          (subCommand) =>
            subCommand
              .setName("bio")
              .setDescription("Set the bio of your server profile.")
              .addStringOption((option) =>
                option
                  .setName("title")
                  .setDescription("Set the title of your bio.")
                  .setRequired(true)
              )
              .addStringOption((option) =>
                option
                  .setName("contents")
                  .setDescription(
                    "What do you want your bio to say? Markdown and in-text links are supported."
                  )
                  .setRequired(true)
              )
        )
        .addSubcommand(
          // Colour
          (subCommand) =>
            subCommand
              .setName("colour")
              .setDescription("Set the colour of your server profile.")
              .addStringOption((option) =>
                option
                  .setName("value")
                  .setDescription("Hex code or pre-defined colour.")
                  .setRequired(true)
              )
        )
        .addSubcommand(
          // Timezone
          (subCommand) =>
            subCommand
              .setName("timezone")
              .setDescription("Set your time zone.")
              .addStringOption((option) =>
                option
                  .setName("tz")
                  .setDescription("Needs to be in tz database format.")
                  .setRequired(true)
              )
        )
        .addSubcommand(
          // Image
          (subCommand) =>
            subCommand
              .setName("image")
              .setDescription("Set an image to display in your server profile.")
              .addStringOption((option) =>
                option
                  .setName("url")
                  .setDescription("Must be a URL to an image.")
                  .setRequired(true)
              )
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("view")
        .setDescription("View a server profile - yours, by default.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription(
              "(Optional) Pick a user whose profile you want to view."
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("clear")
        .setDescription("Clear a field from your server profile.")
        .addStringOption((option) =>
          option
            .setName("field")
            .setDescription("Choose the field to clear.")
            .setRequired(true)
            .addChoice("💣 CLEAR EVERYTHING", "delete")
            .addChoice("Name", "name")
            .addChoice("Birthday & age", "bday")
            .addChoice("Age only", "age")
            .addChoice("Bio", "bio")
            .addChoice("Pride badges", "badges")
            .addChoice("Pronouns", "pronouns")
            .addChoice("Gametags", "gametag")
            .addChoice("Colour", "colour")
            .addChoice("Time zone", "timezone")
            .addChoice("Image", "image")
        )
    ),
  async execute(interaction: any, db: Db) {
    let test: string;
    try {
      test = interaction.options.getSubcommandGroup();
      console.log("Probably a subcommand group. Got", test);
    } catch {
      test = interaction.options.getSubcommand();
      console.log("Probably not a subcommand group. Got", test);
    }
    switch (test) {
      case "view":
        await interaction.deferReply();
        let user = await interaction.options.getUser("user");
        if (!user) user = interaction.user;
        let result = await dbSearch(db, user.id);
        if (result) {
          console.log(result);
          let embed = createEmbed(
            interaction.client,
            result,
            interaction.client.users.cache.get(result._id),
            interaction.guild
          );
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("This user does not have a server proile.");
          if (interaction.user.id == user.id) {
            await interaction.followUp({
              embeds: [setupProfile],
              components: [setupButton],
              ephemeral: true,
            });
          }
        }
        return;
      case "edit":
        await interaction.deferReply({ ephemeral: true });
        let value;
        switch (interaction.options.getSubcommand()) {
          case "badges":
            interaction.editReply({
              content:
                "Click the appropriate buttons below to assign badges to your server profile. When you're done, delete this message.",
              components: [BadgeButton1, BadgeButton2, BadgeButton3],
            });
            break;
          case "name":
            value = interaction.options.getString("value");
            dbUpdate(db, interaction.user.id, "name", value);
            interaction.editReply(`Your __name__ was updated to **${value}**.`);
            break;
          case "birthday":
            value = `${interaction.options.getString(
              "day"
            )} ${interaction.options.getString("month")}`;
            if (
              !/^((31(?!\ (Feb(ruary)?|Apr(il)?|June?|(Sep(?=\b|t)t?|Nov)(ember)?)))|((30|29)(?!\ Feb(ruary)?))|(29(?=\ Feb(ruary)?\ (((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)))))|(0?[1-9])|1\d|2[0-8])\ (Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Ju((ly?)|(ne?))|Aug(ust)?|Oct(ober)?|(Sep(?=\b|t)t?|Nov|Dec)(ember)?)$/.test(
                value
              )
            ) {
              interaction.editReply("This seems like an invalid birthday.");
              return;
            }
            dbUpdate(db, interaction.user.id, "bday", value);
            interaction.editReply(
              `Your __birthday__ was updated to **${value}**.`
            );
            if (interaction.options.getInteger("age")) {
              await dbUpdate(
                db,
                interaction.user.id,
                "age",
                interaction.options.getInteger("age")
              );
              await interaction.editReply(
                `Your __birthday__ was updated to **${value}**.\nYour __age__ was also updated to **${interaction.options.getInteger(
                  "age"
                )}**.`
              );
            }
            break;
          case "gametag":
            value = interaction.options.getString("tag");
            let game = interaction.options.getString("item");
            let deny = `This __${game} tag__ seems like an invalid tag.`;
            let appr = `Your __${game} tag__ was updated to **${value}**.`;
            switch (game) {
              case "genshin":
                if (!/^(\d{9})$/.test(value)) {
                  interaction.editReply(
                    `${deny} Genshin Impact UIDs are nine digits long.`
                  );
                  return;
                }
                await dbUpdate(db, interaction.user.id, "gametag", {
                  genshin: value,
                });
                interaction.editReply(appr);
                break;
              case "fc":
                if (!/(SW-\d{4}-\d{4}-\d{4})/.test(value)) {
                  interaction.editReply(
                    `${deny} Switch friend codes must include the \`SW-\` at the beginning.`
                  );
                  return;
                }
                await dbUpdate(db, interaction.user.id, "gametag", {
                  switch: value,
                });
                interaction.editReply(appr);
                break;
              case "mc":
                interaction.editReply({ embeds: [setupMinecraft] });
                break;
            }
            break;
          case "bio":
            value = {
              title: interaction.options.getString("title"),
              desc: interaction.options.getString("contents"),
            };
            await dbUpdate(db, interaction.user.id, "bio", value);
            interaction.editReply({
              content: "Your __bio__ was updated.",
              embeds: [
                new MessageEmbed()
                  .setTitle(value.title)
                  .setDescription(value.desc),
              ],
            });
            break;
          case "colour":
            let rolecolour;
            value = interaction.options.getString("value");
            if (!/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(value)) {
              let __FOUND = colours.find(function (colour) {
                if (colour.name == value) return true;
              });
              if (__FOUND) {
                rolecolour = __FOUND.hex;
              } else {
                interaction.editReply({
                  content:
                    "The colour you provided was wrong. It must be provided as a hex code, such as `#123abc`, or a pre-defined colour such as `red`.\n\n*Need help choosing a colour? Try one of the buttons below.*",
                  components: [colourButton],
                });
                return;
              }
            } else {
              if (value.charAt(0) == "#") rolecolour = value.substring(1);
              else rolecolour = value;
            }
            await dbUpdate(
              db,
              interaction.user.id,
              "colour",
              parseInt(rolecolour, 16)
            );
            interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setTitle(`Your embed colour was changed to ${value}.`)
                  .setColor(parseInt(rolecolour, 16)),
              ],
            });
            break;
          case "timezone":
            value = interaction.options.getString("tz");
            if (!timezone.tz.zone(value)) {
              interaction.editReply({
                content: `I don't recognize the time zone **tz\`${value}\`**. Please note that **tz** strings are case sensitive.`,
                components: [timezoneButton],
              });
              return;
            }
            await dbUpdate(db, interaction.user.id, "timezone", value);
            interaction.editReply(
              `Your __time zone__ was updated to **tz\`${value}\`**.`
            );
            break;
          case "image":
            value = interaction.options.getString("url");
            if (!isImageURL(value)) {
              interaction.editReply("Your image URL is invalid.");
              return;
            }
            await dbUpdate(db, interaction.user.id, "image", value);
            interaction.editReply(`Your __image__ was updated to **${value}**`);
            break;
        }
        break
      case "clear":
        let field = interaction.options.getString("field");
        let respo = `Your **${field}** was deleted from the profile.`;
        switch (field) {
          case "delete":
            await db
              .collection("profiles")
              .deleteOne({ _id: interaction.user.id });
            await interaction.editReply("Your profile was deleted.");
            break;
          case "name":
          case "age":
          case "bio":
          case "badges":
          case "colour":
          case "timezone":
          case "image":
            await dbClear(db, interaction.user.id, field);
            await interaction.editReply(respo);
            break;
          case "pronouns":
            await dbClear(db, interaction.user.id, field)
              .then(() => {
                let roles = [];
                return roles;
              })
              .then(async (roles) => {
                await dbUpdate(db, interaction.user.id, "pronouns", roles);
                await interaction.editReply(
                  "Your pronouns were reset to the ones you obtained in <#908680453366616069>. If your pronouns are incorrect, please [re-assign the correct pronoun roles](https://ptb.discord.com/channels/908680453219815514/908680453366616069/908957528208060456), then run this command again."
                );
              });
            break;
          case "bday":
            await dbClear(db, interaction.user.id, "age");
            await dbClear(db, interaction.user.id, "bday");
            await interaction.editReply(
              "Your birthday and age was cleared from your profile."
            );
            break;
          case "gametag":
            await interaction.editReply(
              "Choose the game tags you wish to delete. If you changed your mind, just delete this message."
            );
            break;
        }
    }
  },
};

module.exports.help = {
  name: "profile",
  desc: "NYI",
};

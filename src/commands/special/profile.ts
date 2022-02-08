// Importing libraries and whatnot
import {
  MessageEmbed,
  Client,
  MessageButton,
  MessageActionRow,
  Guild,
  CommandInteraction,
  User,
  ButtonInteraction,
  GuildMember,
} from "discord.js";

import { SlashCommandBuilder } from "@discordjs/builders";

import { DateTime } from "luxon";
import * as timezone from "moment-timezone";

import isImageURL from "image-url-validator";

import * as badgeHelper from "../../helpers/profile-badge-helper";
import * as buttonHelper from "../../helpers/profile-button-helper";

import { Db } from "mongodb";

import {
  updateMinecraft,
  parseMinecraft,
} from "../../helpers/minecraft-helper";

/**
 * Create a profile card.
 * @param {Db} db MongoDB object
 * @param {Client} client Discord client object
 * @param r Result object
 * @param {User} user User object
 * @param {Guild} guild Guild object
 */

export async function createEmbed(
  db: Db,
  client: Client,
  r: any,
  user: User,
  guild: Guild
): Promise<MessageEmbed> {
  let time = DateTime.now()
    .setZone(r.timezone)
    .toLocaleString(DateTime.DATETIME_MED);
  console.log(r);
  let embed = new MessageEmbed()
    .setTitle(`**${r.name}**`)
    .setColor(r.colour)
    .setDescription(
      `**Pronouns**: ${r.pronouns.join(", ")}\n**Birthday**: ${r.bday} (age ${
        r.age ? r.age : "unknown"
      })`
    )
    .setThumbnail(r.avatar)
    .setAuthor({ name: String(user.tag) })
    .addField(
      "Game Interests & Hobbies",
      await badgeHelper.spaceout(
        await badgeHelper.createInterestBadges(client, r.user, guild)
      )
    )
    .addField(
      "Staff Badges",
      await badgeHelper.spaceout(
        await badgeHelper.createServerBadges(client, r.user, guild)
      ),
      true
    )
    .addField(
      "Pride Badges",
      r.pride.length !== 0
        ? await badgeHelper.spaceout(
            await badgeHelper.createPrideBadges(r.pride)
          )
        : "No badges",
      true
    )
    .setFooter({ text: `Member ID: ${r.user}` });
  if (r.timezone != null)
    embed.addField(
      `The time for me is ${time}.`,
      `**Time zone**: ${r.timezone}`,
      false
    );
  if (r.bio !== null) embed.addField(r.bio.title, r.bio.desc, false);

  let minecraft: string;
  if (!r.gametags.mc) {
    let res = await updateMinecraft(db, r.user);
    if (res == -1) minecraft = "Unknown";
  } else {
    minecraft = await parseMinecraft(r.gametags.mc);
  }
  if (
    minecraft != "Unknown" ||
    r.gametags.switch ||
    r.gametags.genshin ||
    r.gametags.fortnite
  ) {
    let NX = r.gametags.switch
      ? `**Nintendo Switch FC**: ${r.gametags.switch}\n`
      : "";
    let GS = r.gametags.genshin
      ? `**Genshin Impact UID**: ${r.gametags.genshin}\n`
      : "";
    let FN = r.gametags.fortnite
      ? `**Fortnite username**: ${r.gametags.fortnite}\n`
      : "";
    let MC = (result) => {
      if (!result)
        return "*Run the `view` command again to see Minecraft username*";
      else if (result == "Unknown") return "";
      else return `**Minecraft username**: ${result}`;
    };
    embed.addField("Game tags", `${NX}${GS}${FN}${MC(minecraft)}`);
  }

  try {
    if (r.image !== null) embed.setImage(r.image);
  } catch {
    console.log("No bio image!");
  }
  return embed;
}

async function dbSearch(
  db: Db,
  search: string
) /* Search for a user via memberid. */ {
  return db.collection("profiles").findOne({
    user: search,
  });
}

// Pride badge buttons
const BadgeButton1 = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("View my current badges")
      .setStyle("PRIMARY")
      .setEmoji("🔍")
      .setCustomId("viewPride"),
    new MessageButton()
      .setLabel("Gay")
      .setStyle("SECONDARY")
      .setEmoji("🏳️‍🌈")
      .setCustomId("gay"),
    new MessageButton()
      .setLabel("Lesbian")
      .setStyle("SECONDARY")
      .setEmoji("915950916606242816")
      .setCustomId("les"),
    new MessageButton()
      .setLabel("Bisexual")
      .setStyle("SECONDARY")
      .setEmoji("915950686661906452")
      .setCustomId("bi"),
    new MessageButton()
      .setLabel("Pansexual")
      .setStyle("SECONDARY")
      .setEmoji("915950724838461490")
      .setCustomId("pan")
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
      .setEmoji("🏳️‍⚧️")
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
      .setCustomId("catgender"),
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
      .setLabel("Furry")
      .setStyle("SECONDARY")
      .setEmoji("940491507352354876")
      .setCustomId("furry"),
  ),
  BadgeButton4 = new MessageActionRow().addComponents(
    new MessageButton()
    .setLabel("Clear my badges")
    .setStyle("DANGER")
    .setEmoji("💣")
    .setCustomId("clearPride")
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
    .setLabel("Fortnite Username")
    .setStyle("SECONDARY")
    .setCustomId("clearFortnite"),
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
  {
    name: "red",
    hex: "ff0000",
  },
  {
    name: "orange",
    hex: "e67e22",
  },
  {
    name: "yellow",
    hex: "f1c40f",
  },
  {
    name: "purple",
    hex: "9b59b6",
  },
  {
    name: "lime",
    hex: "2ecc71",
  },
  {
    name: "green",
    hex: "1f8b4c",
  },
  {
    name: "aqua",
    hex: "00d6ff",
  },
  {
    name: "blue",
    hex: "3498db",
  },
  {
    name: "darkBlue",
    hex: "0012c3",
  },
  {
    name: "magenta",
    hex: "ff008f",
  },
  {
    name: "pink",
    hex: "ff7ee7",
  },
  {
    name: "white",
    hex: "ffffff",
  },
  {
    name: "black",
    hex: "000000",
  },
  {
    name: "grey",
    hex: "95a5a6",
  },
  {
    name: "ninja",
    hex: "36393e",
  },
  {
    name: "blurpleOld",
    hex: "7289da",
  },
  {
    name: "blurpleNew",
    hex: "5865f2",
  },
];

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
        .addSubcommand((subcommand) =>
          subcommand
            .setName("avatar")
            .setDescription("Set the avatar on your profile.")
            .addStringOption((option) =>
              option
                .setName("url")
                .setDescription(
                  "Would you like to set a different avatar? Otherwise, I'll use your Discord avatar."
                )
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("pronouns")
            .setDescription(
              "Add a set of neopronouns to your profile. For conventional pronouns, check #role-assign."
            )
            .addStringOption((option) =>
              option
                .setName("pronoun")
                .setDescription('Write in the format "they/them".')
                .setRequired(true)
            )
        )
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
                    "Your (full) IRL name is preferred, but online names are fine as well."
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
                  .addChoice("Fortnite", "fortnite")
                  .addChoice("Genshin Impact", "genshin")
                  .addChoice("Nintendo Switch", "switch")
                  .addChoice("Minecraft", "mc")
              )
              .addStringOption((option) =>
                option
                  .setName("tag")
                  .setDescription("Your FC, username or UID goes here.")
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
  async execute(type: any, db: Db) {
    if (type.isButton()) {
      let interaction: ButtonInteraction = type;
      await interaction.deferUpdate();
      switch (interaction.customId) {
        case "viewPride":
        case "gay":
        case "les":
        case "bi":
        case "pan":
        case "ace":
        case "aro":
        case "trans":
        case "enby":
        case "agender":
        case "gq":
        case "catgender":
        case "ally":
        case "nd":
        case "clearPride":
          await buttonHelper.buttonBadge(interaction, db);
          break;
        case "clearGenshin":
        case "clearFC":
        case "clearMC":
        case "clearTag":
        case "clearFortnite":
          await buttonHelper.clearGametag(interaction, db);
          break;
        case "create":
          await buttonHelper.setupProfile(interaction, db);
          break;
      }
      return;
    }

    let interaction: CommandInteraction = type;
    let test: string;
    try {
      test = interaction.options.getSubcommandGroup();
      console.log("Probably a subcommand group. Got", test);
    } catch {
      test = interaction.options.getSubcommand();
      console.log("Probably not a subcommand group. Got", test);
    }

    let result: any;
    switch (test) {
      case "view":
        await interaction.deferReply();
        let user = interaction.options.getUser("user");
        if (!user) user = interaction.user;
        result = await dbSearch(db, user.id);
        if (result) {
          let embed = await createEmbed(
            db,
            interaction.client,
            result,
            interaction.client.users.cache.get(result.user),
            interaction.guild
          );
          await interaction.editReply({
            embeds: [embed],
          });
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
        await interaction.deferReply({
          ephemeral: true,
        });
        result = await dbSearch(db, interaction.user.id);
        if (!result) {
          interaction.editReply({
            content:
              "It seems you do not have a server profile set up.\nWould you like to create one?",
            components: [setupButton],
          });
          return;
        }
        let value;
        switch (interaction.options.getSubcommand()) {
          case "avatar":
            value = interaction.options.getString("url");
            if (!value)
              value = interaction.user.avatarURL({ dynamic: true, size: 1024 });
            if (!isImageURL(value)) {
              interaction.editReply("Your image URL is invalid.");
              return;
            }
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { avatar: value } }
              );
            interaction.editReply(
              `Your __avatar__ was updated to ** ${value} **`
            );
            break;
          case "pronouns":
            value = interaction.options.getString("pronoun");
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $push: { pronouns: value } }
              );
            interaction.editReply(
              `The __pronoun__ set \`${value}\` was added to your profile.`
            );
            break;
          case "badges":
            interaction.editReply({
              content:
                "Click the appropriate buttons below to assign badges to your server profile. When you're done, dismiss this message.",
              components: [BadgeButton1, BadgeButton2, BadgeButton3, BadgeButton4],
            });
            break;
          case "name":
            value = interaction.options.getString("value");
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { name: value } }
            );
            interaction.editReply(`Your __name__ was updated to **${value}**.`);
            break;
          case "birthday":
            value = `${interaction.options.getInteger(
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
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { bday: value } }
            );
            interaction.editReply(
              `Your __birthday__ was updated to **${value}**.`
            );
            if (interaction.options.getInteger("age")) {
              db.collection("profiles").updateOne(
                { user: interaction.user.id },
                { $set: { age: interaction.options.getInteger("age") } }
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
                db.collection("profiles").updateOne(
                  { user: interaction.user.id },
                  { $set: { "gametags.genshin": value } }
                );
                interaction.editReply(appr);
                break;
              case "switch":
                if (!/(SW-\d{4}-\d{4}-\d{4})/.test(value)) {
                  interaction.editReply(
                    `${deny} Switch friend codes must include the \`SW-\` at the beginning.`
                  );
                  return;
                }
                db.collection("profiles").updateOne(
                  { user: interaction.user.id },
                  { $set: { "gametags.switch": value } }
                );
                interaction.editReply(appr);
                break;
              case "mc":
                interaction.editReply({
                  embeds: [setupMinecraft],
                });
                break;
              case "fortnite":
                db.collection("profiles").updateOne(
                  { user: interaction.user.id },
                  { $set: { "gametags.fortnite": value } }
                );
                interaction.editReply(appr);
                break;
            }
            break;
          case "bio":
            value = {
              title: interaction.options.getString("title"),
              desc: interaction.options.getString("contents"),
            };
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { bio: value } }
            );
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
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { colour: parseInt(rolecolour, 16) } }
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
                content: `I don't recognize the time zone **tz \`${value}\`**. Please note that **tz** strings are case sensitive.`,
                components: [timezoneButton],
              });
              return;
            }
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { timezone: value } }
            );
            interaction.editReply(
              `Your __time zone__ was updated to **tz \`${value}\`**.`
            );
            break;
          case "image":
            value = interaction.options.getString("url");
            if (!isImageURL(value)) {
              interaction.editReply("Your image URL is invalid.");
              return;
            }
            db.collection("profiles").updateOne(
              { user: interaction.user.id },
              { $set: { image: value } }
            );
            interaction.editReply(
              `Your __image__ was updated to ** ${value} **`
            );
            break;
        }
        break;
      case "clear":
        await interaction.deferReply({ ephemeral: true });
        result = await dbSearch(db, interaction.user.id);
        if (!result) {
          interaction.editReply({
            content:
              "It seems you do not have a server profile set up.\nWould you like to create one?",
            components: [setupButton],
          });
          return;
        }
        let field = interaction.options.getString("field");
        let respo = `Your **${field}** was deleted from the profile.`;
        switch (field) {
          case "delete":
            await db.collection("profiles").deleteOne({
              user: interaction.user.id,
            });
            await interaction.editReply("Your profile was deleted.");
            break;
          case "age":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { age: "unknown" } }
              );
            await interaction.editReply(respo);
            break;
          case "bio":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { bio: null } }
              );
            await interaction.editReply(respo);
            break;
          case "timezone":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { timezone: null } }
              );
            await interaction.editReply(respo);
            break;
          case "image":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { image: null } }
              );
            await interaction.editReply(respo);
            break;
          case "badges":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { pride: [] } }
              );
            await interaction.editReply(respo);
            break;
          case "name":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { name: "Anonymous" } }
              );
            await interaction.editReply(respo);
            break;
          case "colour":
            let user = await interaction.user.fetch(true);
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { colour: user.accentColor } }
              );
            await interaction.editReply(respo);
            break;
          case "pronouns":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { pronouns: null } }
              )
              .then(async () => {
                let assign: Array<string> = [];

                let guildMember: GuildMember =
                  await interaction.guild.members.fetch(interaction.user);
                let roles = guildMember.roles.cache;

                if (roles.has("908680453240791048")) assign.push("he/him");
                if (roles.has("908680453240791047")) assign.push("she/her");
                if (roles.has("908680453240791046")) assign.push("they/them");
                if (roles.has("908680453240791045")) assign.push("any/all");
                if (roles.has("908680453240791044")) assign.push("please ask!");

                // Neopronouns
                if (roles.has("923067643869679656")) assign.push("mew/mews");
                if (roles.has("923067492694372412")) assign.push("mo/mos");

                return assign;
              })
              .then(async (roles) => {
                if (!roles) {
                  interaction.editReply(
                    "It seems you haven't assigned your pronouns in <#908680453366616069>. [Do that first](https://ptb.discord.com/channels/908680453219815514/908680453366616069/908957528208060456) before clearing your pronouns in your server profile."
                  );
                  return;
                }
                db.collection("profiles").updateOne(
                  { user: interaction.user.id },
                  { $set: { pronouns: roles } }
                );
                await interaction.editReply(
                  "Your pronouns were reset to the ones you obtained in <#908680453366616069>. If your pronouns are incorrect, please [re-assign the correct pronoun roles](https://ptb.discord.com/channels/908680453219815514/908680453366616069/908957528208060456), then run this command again."
                );
              });
            break;
          case "bday":
            await db
              .collection("profiles")
              .updateOne(
                { user: interaction.user.id },
                { $set: { bday: "Unknown", age: "unknown" } }
              );
            await interaction.editReply(
              "Your birthday and age was cleared from your profile."
            );
            break;
          case "gametag":
            await interaction.editReply({
              content:
                "Choose the game tags you wish to delete. If you changed your mind, just dismiss this message.",
              components: [gameClearButton],
            });
            break;
        }
    }
  },
};

module.exports.help = {
  name: "profile",
  desc: "NYI",
};

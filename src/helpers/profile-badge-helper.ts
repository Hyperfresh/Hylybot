import { Client, User, GuildMember, Guild } from "discord.js";

import { config } from "..";

/**
 * A helper library for building server profiles.
 * @packageDocumentation
 * @module ProfileHelper
 * @category Helpers
 */

/**
 * Returns a bot-usable emoji sting with an emoji's name and ID.
 * @param {Array} name - Array of emoji names.
 * @param {Array} id - Array of emoji IDs.
 */
export async function parseBadges(
  name: Array<string>,
  id: Array<string>,
  badges: Array<string>
) {
  let counter = 0;
  let badgesToAdd = [];
  try {
    name.forEach((Element) => {
      if (badges.includes(Element)) {
        badgesToAdd.push(`<:${name[counter]}:${id[counter]}>`);
      }
      counter += 1;
    });
  } catch (err) {
    console.log("Nothing to parse:", err);
    return ["No badges"];
  }
  return badgesToAdd;
}

/**
 * Constructs badges and returns its length.
 */
export async function construct(r, list: Array<string>) {
  if (r == null) return ["No badges"];
  return list.filter(function (elem) {
    return r.indexOf(elem) > -1;
  }).length;
}

/**
 * Spaces out an array.
 */
export async function spaceout(args) {
  let yes = "";
  if (/^(No)\s(\w+)\s(badges)$/.test(args[0])) return args[0];
  for (let value of args) {
    yes = `${yes} ${value}`;
  }
  return yes;
}

/**
 * Creates server badges.
 */
export async function createServerBadges(
  client: Client,
  user_id: string,
  guild: Guild
) {
  let serverBadgeEmoji = [
    // Full Moderation
    "crown", // Owner
    "zap", // Admin
    "star", // Moderator

    // Bots
    "tools", // Hylybot Master
    "wrench", // Bot Master

    // Semi-moderaion
    "pushpin", // Media Pinner
    "video_game", // Game Event Co-ordinator
    "tada", // Giveaways
    "speech_left", // Splatulated Staff
  ];
  let badgesToAdd = [];
  let r = [];

  let user: User = client.users.cache.get(user_id);
  let guildMember: GuildMember = await guild.members.fetch(user);
  let roles = guildMember.roles.cache;

  if (config.OWNER_ID.includes(user_id)) r.push("crown", "tools");
  // Owner
  else if (roles.has("908691786669654047")) r.push("zap");
  // Admin
  else if (roles.has("908691413372395541")) r.push("star"); // Moderator

  if (roles.has("909235572755800104")) r.push("wrench"); // Bot Master
  if (roles.has("908680453286924303")) r.push("pushpin"); // Media Pinner
  if (roles.has("908680453286924305")) r.push("video_game"); // Game Event Coordinator
  if (roles.has("908680453286924301")) r.push("tada"); // Giveaways
  if (roles.has("908680453286924302")) r.push("speech_left"); // Splatulated Staff

  let counter = 0;
  serverBadgeEmoji.forEach((Element) => {
    if (r.includes(Element)) {
      badgesToAdd.push(`:${serverBadgeEmoji[counter]}:`);
    }
    counter += 1;
  });
  if (badgesToAdd.length == 0) return ["No badges"];
  return badgesToAdd;
}

/**
 * Creates pride badges.
 */
export async function createPrideBadges(r) {
  if (r === null) return "No pride badges";

  // Create pride badges for embeds & database.
  // Declare variable types.
  let badgesToAdd = [];
  let fullList = [
    // This list is the full resolve for each pride badge.
    ":transgender_flag:",
    ":rainbow_flag:",
    "<:enby:915950848121663559>",
    "<:aro:915950829054332959>",
    "<:ace:915950767649734757>",
    "<:gq:915950873098747915>",
    "<:pan:915950724838461490>",
    "<:bi:915950686661906452>",
    "<:les:915950916606242816>",
    "<:agender:915950806925213706>",
    "<:nd:798918686676353034>",
    "<:catgender:916128763203420161>",
    "<:ally:916128799479955467>",
  ];
  let prideBadgeEmoji = [
    "enby",
    "aro",
    "ace",
    "gq",
    "pan",
    "bi",
    "les",
    "agender",
    "nd",
    "catgender",
    "ally",
  ]; // Badge types
  let prideBadgeEmoID = [
    "915950848121663559",
    "915950829054332959",
    "915950767649734757",
    "915950873098747915",
    "915950724838461490",
    "915950686661906452",
    "915950916606242816",
    "915950806925213706",
    "798918686676353034",
    "916128763203420161",
    "916128799479955467",
  ];

  let found = await construct(r, fullList);
  if (found == ["No badges"]) return found;
  if (found) {
    // Function being used to construct pride badges for embed.
    // Convert constructed badges from database to badge types
    let temp = [];
    for (let i = 0; i < fullList.length; i++) {
      if (r.includes(fullList[i])) {
        if (fullList[i] == ":transgender_flag:") temp.push("trans");
        else if (fullList[i] == ":rainbow_flag:") temp.push("gay");
        else temp.push(prideBadgeEmoji[i]);
      }
    }
    r = temp;
  }

  badgesToAdd = await parseBadges(prideBadgeEmoji, prideBadgeEmoID, r);
  if (r.includes("trans")) {
    badgesToAdd.push(":transgender_flag:");
  }
  if (r.includes("gay")) {
    badgesToAdd.push(":rainbow_flag:");
  }
  if (badgesToAdd.length == 0) return ["No badges"];
  return badgesToAdd;
}

/**
 * Creates interest badges.
 */
export async function createInterestBadges(
  client: Client,
  user_id: string,
  guild: Guild
) {
  // Declare variable types.
  let fullList = [
    // This list is the full resolve for each interest badge.
    "<:minecraft:817185848373542963>",
    "<:amogus:817207798583525386>",
    "<:splatoon:817209133526024243>",
    "<:animalcrossing:817207987240304690>",
    "<:mariokart:883867410636099605>",
    "<:fortnite:919212370524504084>",
    "<:paimon:908995938834608158>",
    ":video_game:",
    ":musical_note:",
    ":paintbrush:",
    ":desktop:",
  ];

  let badgesToAdd = [];
  let r = [];

  let user: User = client.users.cache.get(user_id);
  let guildMember: GuildMember = await guild.members.fetch(user);
  let roles = guildMember.roles.cache;

  // Custom emojis & game events
  if (roles.has("908680453253378076")) r.push(fullList[0]);
  if (roles.has("908680453253378074")) r.push(fullList[1]);
  if (roles.has("908680453253378071")) r.push(fullList[2]);
  if (roles.has("908680453253378072")) r.push(fullList[3]);
  if (roles.has("908680453240791049")) r.push(fullList[4]);
  if (roles.has("925603076822405120")) r.push(fullList[5]);
  if (roles.has("908900125911437332")) r.push(fullList[6]);
  if (roles.has("908680453253378073")) r.push(":video_game:");

  // Now the fun stuff
  if (roles.has("908680453219815518")) r.push(":paintbrush:");
  if (roles.has("908680453219815517")) r.push(":musical_note:");
  if (roles.has("908680453219815516")) r.push(":desktop:");

  let counter = 0;
  fullList.forEach((Element) => {
    if (r.includes(Element)) {
      badgesToAdd.push(`${fullList[counter]}`);
    }
    counter += 1;
  });
  if (badgesToAdd.length == 0) return ["No badges"];
  return badgesToAdd;
}

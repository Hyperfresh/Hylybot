import {
  ButtonInteraction,
  GuildMember,
} from "discord.js";
import { Db } from "mongodb";
import * as badgeHelper from "./profile-badge-helper";

import {createEmbed} from "../commands/special/profile"

async function dbSearch(
  db: Db,
  search: string
) /* Search for a user via memberid. */ {
  return db.collection("profiles").findOne({
    user: search,
  });
}

export async function buttonBadge(interaction: ButtonInteraction, db: Db) {
  console.log(interaction);
  let result = await dbSearch(db, interaction.user.id);
  if (interaction.customId == "viewPride") {
    if (result.pride.length == 0) {
      interaction.editReply("You have no badges assigned.");
      return;
    }
    let badges = await badgeHelper.spaceout(
      await badgeHelper.createPrideBadges(result.pride)
    );
    interaction.editReply(`Here are your current badges: ${badges}`);
    return;
  }
  if (interaction.customId == "clearPride") {
    await db
      .collection("profiles")
      .updateOne({ user: interaction.user.id }, { $set: { pride: [] } });
    interaction.editReply("Your badges were cleared.");
    return;
  }
  if (result.pride && result.pride.includes(interaction.customId)) {
    interaction.editReply(
      "You already have this pride badge. Made a mistake, and trying to undo? Sorry - due to array limitations, you'll have to 💣 clear and start again. :("
    );
    return;
  }

  await db
    .collection("profiles")
    .updateOne(
      { user: interaction.user.id },
      { $push: { pride: interaction.customId } }
    );
  interaction.editReply(
    `The badge \`${interaction.customId}\` was added to your profile.`
  );
}

export async function clearGametag(interaction: ButtonInteraction, db: Db) {
  let result = await dbSearch(db, interaction.user.id);
  if (!result.gametags) {
    interaction.editReply("There are no gametags to clear!");
    return;
  }
  if (interaction.customId == "clearMC") {
    interaction.editReply(
      "Your Minecraft username is linked with Hylybot to ensure you are able to log onto our private Minecraft server.\nIf you wish to remove your Minecraft username, and hence lose access to our Minecraft server, [please contact the Cephalosquad](https://discord.com/channels/908680453219815514/908680453366616068/909038778390298655)."
    );
    return;
  }
  let noneExists = "You don't have this gametag. Chances are you've cleared it already."
  switch (interaction.customId) {
    case "clearGenshin":
      if (result.gametags.genshin == null) {
        await interaction.editReply(noneExists)
        return
      }
      db
      .collection("profiles")
      .updateOne({ user: interaction.user.id }, { $unset: {"gametags.genshin": ""}})
      .then(async () => await interaction.editReply("Your Genshin Impact UID was cleared."))
      .catch(async () => await interaction.editReply(noneExists))
      break      
    case "clearFortnite":
      if (result.gametags.fortnite == null) {
        await interaction.editReply(noneExists)
        return
      }
      db
      .collection("profiles")
      .updateOne({ user: interaction.user.id }, { $unset: {"gametags.fortnite": ""}})
      .then(async () => await interaction.editReply("Your Fortnite username was cleared."))
      .catch(async () => await interaction.editReply(noneExists))
      break
    case "clearFC":
      if (result.gametags.switch == null) {
        await interaction.editReply(noneExists)
        return
      }
      db
      .collection("profiles")
      .updateOne({ user: interaction.user.id }, { $unset: {"gametags.switch": ""}})
      .then(async () => await interaction.editReply("Your Nintendo Switch FC was cleared."))
      .catch(async () => await interaction.editReply(noneExists))
      break
  }
}

export async function setupProfile(interaction: ButtonInteraction, db: Db) {
  let result = await dbSearch(db, interaction.user.id);
  if (result) {
    interaction.editReply("You've already created your server profile!");
    return;
  }

  let assign: Array<string> = [];

  let guildMember: GuildMember = await interaction.guild.members.fetch(
    interaction.user
  );
  let roles = guildMember.roles.cache;

  if (roles.has("908680453240791048")) assign.push("he/him");
  if (roles.has("908680453240791047")) assign.push("she/her");
  if (roles.has("908680453240791046")) assign.push("they/them");
  if (roles.has("908680453240791045")) assign.push("any/all");
  if (roles.has("908680453240791044")) assign.push("please ask!");

  // Neopronouns
  if (roles.has("923067643869679656")) assign.push("mew/mews");
  if (roles.has("923067492694372412")) assign.push("mo/mos");

  if (!assign || assign.length == 0) {
    interaction.editReply(
      "It seems you haven't assigned your pronouns in <#908680453366616069>. [Do that first](https://ptb.discord.com/channels/908680453219815514/908680453366616069/908957528208060456) before setting up your profile."
    );
    return;
  }

  let user = await interaction.user.fetch(true);

  await db.collection("profiles").insertOne({
    user: user.id,
    name: "Anonymous",
    bday: "Unknown",
    age: null,
    pronouns: assign,
    pride: [],
    colour: user.accentColor,
    timezone: null,
    bio: null,
    gametags: {
      genshin: null,
      mc: null,
      switch: null,
      fortnite: null
    },
    image: user.bannerURL({ dynamic: true }),
    usertag: interaction.user.tag,
  });

  let embed = await createEmbed(
    db,
    interaction.client,
    await dbSearch(db, user.id),
    user,
    interaction.guild
  );
  interaction.editReply({
    content:
      "All done! Your profile has been successfully created.\nYou'll see below what it looks like at the moment: if you want to change anything, try `/profile edit`.",
    embeds: [embed],
  });
}

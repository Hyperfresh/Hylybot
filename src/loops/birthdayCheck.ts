import { Client, GuildMember, MessageEmbed } from "discord.js";
import { Db } from "mongodb";

import { DateTime } from "luxon";

import { config } from "..";

export default async function birthdayCheck(db: Db, bot: Client) {
  let today = DateTime.now();
  let hh = today.hour;

  if (hh == 7) {
    console.log("Checking birthdays...");
    let guild = bot.guilds.cache.find((val) => val.id == config.GUILD_ID);
    let oldMembers = guild.roles.fetch(config.BIRTH_ID);

    (await oldMembers).members.forEach(async (user: GuildMember) => {
      try {
        await user.roles.remove(config.BIRTH_ID);
      } catch (e) {
        console.error(e);
      }
    });

    let dd = String(today.day);
    let mm = today.monthShort;
    let todayString = `${dd} ${mm}`;

    let data = await db
      .collection("profiles")
      .find({ bday: { $eq: todayString } })
      .toArray();

    if (data.length >= 1) {
      console.log(`Found ${data.length}:`, data);
      let channel: any = guild.channels.cache.find(
        (val) => val.id == config.ANNOU_ID
      );

      data.forEach(async (user) => {
        // Get first name only
        let name: string = user.name;
        let nameArray = name.split(" ");

        let userInfo = await guild.members.fetch(user.user);
        userInfo.roles.add(config.BIRTH_ID);
        const embed = new MessageEmbed();
        embed.setTitle(`Happy birthday, ${name}! 🎉`);
        embed.setDescription(`<@!${userInfo.id}> was born on ${todayString}.`);
        embed.setColor("#FFFF72");
        embed.setThumbnail(
          userInfo.user.avatarURL({ dynamic: true, size: 128 })
        );
        if (user.age != null) {
          embed.setFooter({text: `${nameArray[0]} turned ${user.age + 1} today!`});
          await db
            .collection("profiles")
            .updateOne({ user: userInfo.id }, { $inc: { age: 1 } });
        }

        channel.send({
          content: `**Hey @everyone - go wish <@!${userInfo.id}> happy birthday!** 🎉🎉`,
          embeds: [embed],
        });
      });
    } else console.log("No birthdays found.");
  }
}

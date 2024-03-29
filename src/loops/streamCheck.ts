import { Client, MessageEmbed } from "discord.js";
import { Db } from "mongodb";
import fetch from "node-fetch";
import Bot from "../Bot";

let working = true;

export default async function streamCheck(db: Db, bot: Client) {
    if (!working) return;

    let guild = bot.guilds.cache.find((val) => val.id == Bot.config.GUILD_ID);
    // First get array
    let streamers = await db.collection("streams").find({ type: "twitch" }).project({ channel: 1 }).toArray();
    let streamsList: Array<string> = [];
    streamers.forEach(stream => {
        streamsList.push(stream.channel);
    });
    await fetch(
        `https://api.twitch.tv/helix/streams/?user_login=${streamsList.join("&user_login=")}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${Bot.config.TWITCH_AT}`,
            "Client-Id": Bot.config.TWITCH_ID
        }
    }).then(res => res.json())
        .then(async res => {
            if (res.error) {
                working = false;

                let embed = new MessageEmbed()
                    .setTitle("Twitch stream checking has crashed.")
                    .setThumbnail("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.techhive.com%2Fimages%2Farticle%2F2015%2F04%2Fsad-mac-100580105-large.jpg&f=1&nofb=1")
                    .setColor("RED")
                    .setDescription("I've ran into an error when checking Twitch streams. Chances are that my Twitch token needs to be updated, so please get my bot author's attention!")
                    .addField("Error details", `**${res.status} ${res.error}**: ${res.message}`)
                    .setFooter({ text: "Twitch stream checking will be disabled until I have been restarted." });

                let channel: any = guild.channels.cache.find(
                    (val) => val.id == Bot.config.MODLOG_ID
                );
                return channel.send({ content: `<@&${Bot.config.MODROLE_ID}>`, embeds: [embed] });
            }

            let streams = await db.collection("streams").find({ type: { $not: { $gt: "youtube" } } }).toArray()
            streams.forEach(async stream => {
                if (res.data.includes(stream.channel)) {
                    await db.collection("streams").updateOne(stream, {$set: {live: true}})
                    let notify = stream.notify ? `<@&${stream.notify}>,` : ""
                    let channel: any = guild.channels.cache.find(
                        (val) => val.id == stream.announce
                    );
                    let item = res.data.filter(stream => stream.user_login == stream.channel)
                    channel.send(`${notify} __**${item.user_name}**__ is 🔴 LIVE with **${item.game_name}**: "${item.title}"\n\nhttps://twitch.tv/${item.user_login}`)
                } else {
                    await db.collection("streams").updateOne(stream, {$set: {live: false}})
                }
            })
        })
}
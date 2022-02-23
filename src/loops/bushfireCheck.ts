import fetch from "node-fetch";
import { MessageEmbed, Client } from "discord.js";
import { Db, ObjectId } from "mongodb";
import { DateTime } from "luxon";
import { parseStringPromise } from "xml2js";

import { config } from "..";
const ratingObject = new ObjectId(config.RAT_OBJ)

export default async function ratingCheck(bot: Client, db: Db) {
    let guild = bot.guilds.cache.find((val) => val.id == config.GUILD_ID);
    let channel: any = guild.channels.cache.find(
        (val) => val.id == config.ALERT_ID
      );

    let today = DateTime.now()
    let hh = today.hour

    if (hh == 18) {
        console.log("Checking fire danger ratings...")
        fetch(config.RATINGS_SA)
            .then(res => res.text())
            .then(data => parseStringPromise(data)
            .then(async items => {
                let forecastData = items.product.forecast[0]
                let datapush = []
                for (let x = 1; x <= forecastData.area.length; x++) {
                    let forecast = []
                    forecastData.area[x]["forecast-period"].forEach(item => {
                        try {
                            forecast.push({
                              start: DateTime.fromISO(item.$["start-time-local"]).toMillis(),
                              level: item.text[0]._,
                              ban: item.text[1]._,
                            });
                          } catch {
                            forecast.push({
                              start: DateTime.fromISO(item.$["start-time-local"]).toMillis(),
                              level: item.text[0]._,
                              ban: "false",
                            });
                          }
                    })
                    datapush.push({
                        // push into an array of JSON objects
                        area: forecastData.area[x].$.description,
                        forecast: forecast,
                      });
                }
                await db.collection("ratings-sa").findOneAndReplace({_id: ratingObject}, {$set: {ratings: datapush}})
            })
            .then(async () => {
                let items = (await db.collection("ratings-sa").findOne({_id: ratingObject})).ratings
                let info = []
                items.forEach(item => {
                    info.push(`**${item.area}**: ${item.forecast[1].level}`)
                })
                let embed = new MessageEmbed()
                    .setAuthor({name: "SA Country Fire Service", url: "https://cfs.sa.gov.au", iconURL: ""})
                    .setTitle("Tomorrow's Fire Danger Ratings")
                    .setDescription(info.join("\n"))
                    .setFooter({text: "Powered by OzAlert"})

                await channel.send({content: "<@&908680453253378070>", embeds: [embed]})
            })
        )
    }
}
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";

import { DateTime } from "luxon";
import { Db, Document, WithId } from "mongodb";
import fetch from "node-fetch";
import Bot from "../../Bot";

let lastRun = DateTime.now();

const cooldownEmbed = new MessageEmbed()
    .setTitle("Hey, slow down!")
    .setDescription(
        `To avoid reaching OpenWeatherMap quotas, the weather can only be checked once per minute. Please try again later.`
    )
    .setColor("#ff0000")
    .setThumbnail(
        "https://media.discordapp.net/attachments/798903453438050324/931078218792980490/emoji.png"
    );

function titleCase(str) {
    str = str.toLowerCase().split(" ");
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
}

/**
 * Creates a MessageEmbed containing weather information.
 * @param measure Unit of measurement (imperial/metric)
 * @param location Location to search
 * @returns MessageEmbed
 */
async function returnWeatherEmbed(measure: string, location: string) {
    let temp = measure == "metric" ? "℃" : "℉";

    let embed = new MessageEmbed();
    let alerts: Array<MessageEmbed> = [];
    let coords: Array<number> = [0, 0];
    await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${Bot.config.WEATHER_KEY}&units=${measure}`
    )
        .then((res) => res.json())
        .then((data: any) => {
            console.log("Retrieved weather data.", data);
            coords = [data.coord.lat, data.coord.lon];
            let windSpeed =
                measure == "metric"
                    ? `${(data.wind.speed * (18 / 5)).toFixed(2)}km/h`
                    : `${data.wind.speed.toFixed(2)}mph`;
            let windGust =
                measure == "metric"
                    ? `${(data.wind.gust * (18 / 5)).toFixed(2)}km/h`
                    : `${data.wind.gust.toFixed(2)}mph`;
            let rain: any;
            if (data.rain) {
                rain =
                    measure == "metric"
                        ? `${data.rain["3h"].toFixed(2)}mm`
                        : `${(data.rain["3h"] * 0.03937).toFixed(2)}in`;
            } else {
                rain = "no rain";
            }
            embed
                .setAuthor({ name: `${data.name}, ${data.sys.country}` })
                .setTitle(titleCase(data.weather[0].description))
                .setDescription(
                    `> **Currently, it's ${data.main.temp.toFixed(
                        0
                    )}${temp}**. (Feels like ${data.main.feels_like.toFixed(
                        0
                    )}${temp} | <:high:931085546338545684> ${data.main.temp_max.toFixed(
                        0
                    )}${temp} | <:low:931085579939106826> ${data.main.temp_min.toFixed(
                        0
                    )}${temp})\n♨ **Humidity**: ${data.main.humidity
                    }%\n☁️ **Cloud cover**: ${data.clouds.all
                    }%\n💨 **Wind**: ${windSpeed} winds @ ${data.wind.deg
                    }° (${windGust} gusts)\n🌧 **Rain**: ${rain} recorded over the past 3 hours\n**Sunrise & sunset**: 🔺 <t:${data.sys.sunrise
                    }:t> 🔻 <t:${data.sys.sunset}:t>`
                )
                .setThumbnail(
                    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
                )
                .setFooter({ text: "Data from OpenWeatherMap" })
                .setTimestamp();
        })
        .catch((err) => {
            embed
                .setTitle(
                    "An error occurred at `fetch weather`. Please report this to the bot maintainer."
                )
                .setDescription(String(err));
        });
    await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${coords[0]}&lon=${coords[1]}&exclude=current,minutely,hourly&units=${measure}&appid=${Bot.config.WEATHER_KEY}`
    )
        .then((res) => res.json())
        .then((data) => {
            console.log("Retrieved onecall data.", data);
            if (data.alerts) {
                data.alerts.forEach((item) =>
                    alerts.push(
                        new MessageEmbed()
                            .setAuthor({ name: "WEATHER ALERT" })
                            .setColor("YELLOW")
                            .setTitle(`${item.event} - Issued <t:${item.start}:f>`)
                            .setDescription(item.description)
                            .addField(
                                `Issued by ${item.sender_name}`,
                                `Expires at <t:${item.end}:f>`
                            )
                            .setFooter({ text: "via OpenWeatherMap" })
                    )
                );
            }
            let forecast: Array<string> = [];
            data.daily.forEach((item) => {
                let thisDay = DateTime.fromSeconds(item.dt).toFormat("cccc d LLL");
                forecast.push(
                    `**${thisDay}**: ${item.weather[0].description
                    } (<:high:931085546338545684> ${item.temp.max.toFixed(
                        0
                    )}${temp} | <:low:931085579939106826> ${item.temp.min.toFixed(
                        0
                    )}${temp})\n`
                );
            });
            embed.addField("Forecast", forecast.join(""));
        })
        .catch((err) => {
            embed
                .setTitle(
                    "An error occurred at `fetch onecall`. Please report this to the bot maintainer."
                )
                .setDescription(String(err));
        });
    return { embed, alerts };
}

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("weather")
        .setDescription(
            "Get the weather of where someone lives, or somewhere else in the world"
        )
        .addSubcommandGroup((group) =>
            group
                .setName("user")
                .setDescription(
                    "View the weather for a user or set your weather location."
                )
                .addSubcommand((sub) =>
                    sub
                        .setName("view")
                        .setDescription("View the weather for a user.")
                        .addUserOption((opt) =>
                            opt
                                .setName("who")
                                .setDescription(
                                    "Did you want to look up the weather for someone else?"
                                )
                                .setRequired(false)
                        )
                        .addStringOption((opt) =>
                            opt
                                .setName("measurement")
                                .setDescription("What measurement? Celsius is default.")
                                .setRequired(false)
                                .addChoices(
                                    { name: "Celsius / Metric", value: "metric" },
                                    { name: "Fahrenheit / Imperial", value: "imperial" }
                                )
                        )
                )
                .addSubcommand((sub) =>
                    sub
                        .setName("set")
                        .setDescription(
                            "Set the location to search when someone checks your weather."
                        )
                        .addStringOption((opt) =>
                            opt
                                .setName("city")
                                .setDescription("Set your city.")
                                .setRequired(true)
                        )
                        .addStringOption((opt) =>
                            opt
                                .setName("country")
                                .setDescription("Set your country.")
                                .setRequired(true)
                        )
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("location")
                .setDescription("View the weather for a set location.")
                .addStringOption((opt) =>
                    opt.setName("city").setDescription("What city?").setRequired(true)
                )
                .addStringOption((opt) =>
                    opt
                        .setName("country")
                        .setDescription("What country?")
                        .setRequired(true)
                )
                .addStringOption((opt) =>
                    opt
                        .setName("measurement")
                        .setDescription("What measurement? Celsius is default.")
                        .setRequired(false)
                        .addChoices(
                            { name: "Celsius / Metric", value: "metric" },
                            { name: "Fahrenheit / Imperial", value: "imperial" }
                        )
                )
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        let test: string;
        try {
            test = interaction.options.getSubcommandGroup();
            console.log("Probably a subcommand group. Got", test);
        } catch {
            test = interaction.options.getSubcommand();
            console.log("Probably not a subcommand group. Got", test);
        }

        if (test == "user") {
            let result: WithId<Document>;
            switch (interaction.options.getSubcommand()) {
                case "view":
                    await interaction.deferReply();
                    if (lastRun.plus({ minutes: 1 }) > DateTime.now()) {
                        interaction.editReply({
                            content: "⏳ **Slow down!**",
                            embeds: [cooldownEmbed],
                        });
                        return;
                    }
                    lastRun = DateTime.now();
                    let user: User = interaction.options.getUser("who");
                    if (!interaction.options.getUser("who")) user = interaction.user;
                    result = await db.collection("weather").findOne({ user: user.id });
                    if (!result) {
                        interaction.editReply(
                            "This user has not set up their weather location."
                        );
                        if (user == interaction.user)
                            interaction.followUp({
                                content:
                                    "Use the `/weather user set` command to set your weather location.",
                                ephemeral: true,
                            });
                        return;
                    }
                    let measure = interaction.options.getString("measurement");
                    if (!measure) measure = "metric";
                    let embed = await returnWeatherEmbed(measure, result.location);
                    await interaction.editReply({
                        content: `Here's the weather for **${user.username}**.`,
                        embeds: [embed.embed],
                    });
                    if (embed.alerts.length)
                        await interaction.followUp({
                            content: `> ⚠️ **A weather warning is active for this location.**`,
                            embeds: embed.alerts,
                        });
                    break;
                case "set":
                    await interaction.deferReply({ ephemeral: true });
                    let item = `${interaction.options.getString(
                        "city"
                    )}, ${interaction.options.getString("country")}`;
                    result = await db
                        .collection("weather")
                        .findOne({ user: interaction.user.id });
                    if (!result) {
                        await db
                            .collection("weather")
                            .insertOne({ user: interaction.user.id, location: item });
                    } else {
                        await db
                            .collection("weather")
                            .updateOne(
                                { user: interaction.user.id },
                                { $set: { location: item } }
                            );
                    }
                    interaction.editReply(`Your location was set to **${item}**.`);
                    break;
                default:
                    throw new Error();
            }
        } else {
            await interaction.deferReply();
            if (lastRun.plus({ minutes: 1 }) > DateTime.now()) {
                interaction.editReply({
                    content: "⏳ **Slow down!**",
                    embeds: [cooldownEmbed],
                });
                return;
            }
            let measure = interaction.options.getString("measurement");
            if (!measure) measure = "metric";
            let location = `${interaction.options.getString(
                "city"
            )}, ${interaction.options.getString("country")}`;
            let embed = await returnWeatherEmbed(measure, location);
            await interaction.editReply({
                content: `Here's the weather for **${location}**.`,
                embeds: [embed.embed],
            });
            if (embed.alerts)
                await interaction.followUp({
                    content: `> ⚠️ **A weather warning is active for this location.**`,
                    embeds: embed.alerts,
                });
        }
    },
};

module.exports.help = {
    name: "weather",
    desc: "get the weather",
};

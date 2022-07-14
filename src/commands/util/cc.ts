import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { Db, ObjectId } from "mongodb";
import Bot from "../../Bot";

const fx = require("money");
const oxr = require("open-exchange-rates");
oxr.set({ app_id: Bot.config.CC_API_KEY });
const object = Bot.config.CC_OBJECT ? new ObjectId(Bot.config.CC_OBJECT) : null;

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("cc")
        .setDescription("Convert currencies around the world.")
        .addStringOption((option) =>
            option
                .setName("convert_from")
                .setDescription(
                    "Enter the currency you're converting from (eg, 'USD')."
                )
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("value")
                .setDescription("Enter the foreign value.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("convert_to")
                .setDescription(
                    "(Optional) Enter the currency to convert to. Defaults to AUD."
                )
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        await interaction.deferReply();

        let search: any = await db.collection("currencies").findOne({ _id: object });
        if (
            Number(search.timestamp) + 86400000 <= DateTime.now().toMillis() ||
            search.timestamp == "undefined"
        ) {
            await oxr.latest(async () => {
                const update = {
                    rates: oxr.rates,
                    base: oxr.base,
                    timestamp: String(oxr.timestamp),
                };
                await db.collection("currencies").replaceOne({ _id: object }, update);
                console.log("Currency rates updated");
                search = await db.collection("currencies").findOne({ _id: object });
            });
        }

        let value = interaction.options.getNumber("value", true).toFixed(2);
        let convertFrom = interaction.options
            .getString("convert_from", true)
            .toUpperCase();
        let convertTo = interaction.options.getString("convert_to");
        try {
            let result;
            if (!convertTo) {
                convertTo = "aud";
            }
            console.log(search);
            fx.rates = search.rates;
            fx.base = search.base;
            result = fx.convert(value, {
                from: convertFrom,
                to: convertTo.toUpperCase(),
            });
            let embed = new MessageEmbed()
                .setAuthor({ name: `${value} ${convertFrom} is` })
                .setTitle(`-> ${result.toFixed(2)} ${convertTo.toUpperCase()}`)
                .setDescription(
                    "Rates are from [Open Exchange Rates](https://openexchangerates.org), updated every 24 hours."
                )
                .setFooter({ text: "Rates last updated" })
                .setTimestamp(Number(search.timestamp));
            interaction.editReply({ embeds: [embed] });
        } catch (err) {
            interaction.editReply({
                content: `An error occurred: \`\`\`${err}\`\`\``,
            });
        }
    },
};

module.exports.help = {
    name: "cc",
    usage: "/cc <currency> <value> [convert]",
    desc: "Convert currencies around the world. By default, it converts to AUD.",
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

const config = require("../../../data/config");

const fx = require("money");
const oxr = require("open-exchange-rates");
oxr.set({ app_id: config.CC_API_KEY });

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
  async execute(interaction, db) {
    await interaction.deferReply();
    let value = interaction.options.getNumber("value").toFixed(2);
    let convertFrom = interaction.options
      .getString("convert_from")
      .toUpperCase();
    let convertTo = interaction.options.getString("convert_to");
    try {
      let result;
      if (!convertTo) {
        convertTo = "aud";
      }
      oxr.latest(() => {
        fx.rates = oxr.rates;
        fx.base = oxr.base;
        result = fx.convert(value, {
          from: convertFrom,
          to: convertTo.toUpperCase(),
        });
        let embed = new MessageEmbed()
        .setAuthor(`${value} ${convertFrom} is`)
        .setTitle(`-> ${result.toFixed(2)} ${convertTo.toUpperCase()}`)
        .setDescription(
          "Rates are from [Open Exchange Rates](https://openexchangerates.org)."
        )
        .setFooter("Rates last updated")
        .setTimestamp(oxr.timestamp);
       interaction.editReply({ embeds: [embed] });
      });
    } catch (err) {
      interaction.editReply({
        content: `An error occurred: \`\`\`${err}\`\`\``,
        ephemeral: true,
      });
    }
  },
};

module.exports.help = {
  name: "cc",
  usage: "/cc <currency> <value> [convert]",
  desc: "Convert currencies around the world",
};

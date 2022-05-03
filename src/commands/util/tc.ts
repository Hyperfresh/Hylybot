import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Db } from "mongodb";

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("tc")
        .setDescription("Convert between Celsius and Farenheit temperatures.")
        .addNumberOption((option) =>
            option
                .setName("value")
                .setDescription("The value you want to convert")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("temp")
                .setDescription("What temperature unit are you converting from?")
                .addChoices(
                    { name: "Celsius", value: "C" },
                    { name: "Fahrenheit", value: "F" }
                )
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        let temp = interaction.options.getNumber("value");
        if (interaction.options.getString("temp") == "C") {
            await interaction.reply(`${(temp * 1.8 + 32).toFixed(2)}℉`);
        } else {
            await interaction.reply(`${((temp - 32) / 1.8).toFixed(2)}℃`);
        }
    },
};

module.exports.help = {
    name: "tc",
    usage: "/temp <temp> <value>",
    desc: "Convert between Celsius and Farenheit temperatures.",
};

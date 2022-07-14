import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { Db } from "mongodb";

// View the birthday of someone.

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("birthday")
        .setDescription("View your birthday, or someone else's.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Whose birthday do you want to check?")
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction, db: Db) {
        // Check if a user was supplied, otherwise use the user who invoked the command.
        await interaction.deferReply();
        let user = interaction.options.getUser("user");
        if (!user) user = interaction.user;
        // Search on the database for a result.
        let result = await db.collection("profiles").findOne({ user: user.id });
        if (!result || result.bday == "Unknown") {
            interaction.editReply("This user hasn't registered their birthday.");
            if (user.id == interaction.user.id)
                interaction.followUp({
                    content: "To register your birthday, use `/profile edit bday`.",
                    ephemeral: true,
                });
            return;
        }
        // Get their name and birthday (stored as a string), and split the strings into an array
        let nameResult: string = result.name;
        let nameArray: Array<string> = nameResult.split(" ");
        let bdayResult: string = result.bday;
        let bdayArray: Array<string> = bdayResult.split(" ");
        let now = DateTime.now();
        let bdayParse: string;
        if (now.monthShort == "Dec" && bdayArray[1] != "Dec")
            bdayParse = `${bdayArray[0]} ${bdayArray[1]} ${now.year + 1}`;
        else bdayParse = `${bdayArray[0]} ${bdayArray[1]} ${now.year}`;
        let bday = DateTime.fromFormat(bdayParse, "d LLL yyyy");
        let length = bday.diff(now);
        let birthday: string = ""
        console.log(bdayParse, bday, length);
        // Change the text depending how close the birthday is
        if (length.toMillis() <= 604800000) {
            birthday = `is <t:${bday.toSeconds()}:R>.`;
        }
        if (length.toMillis() < 0 && length.toMillis() >= -604800000) {
            let remain;
            if (length.toMillis() >= -86400000) {
                birthday = `is today!`;
            } else {
                birthday = `was <t:${bday.toSeconds()}:R>.`;
            }
        }
        // Reply to interaction.
        if (!birthday) birthday = `is on ${bday.toFormat("dd LLL")}.`;
        interaction.editReply(`**${nameArray[0]}**'s birthday ${birthday}`);
    },
};

module.exports.help = {
    name: "birthday",
    desc: "View your birthday, or someone else's.",
};

import Bot from './Bot';

var copy = String(`
Hylybot - the custom-built Discord bot for the Hyla + Friends server.
Copyright (C) 2021 Hyla A | https://github.com/Hyperfresh/Hylybot

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
`);

console.log(copy);

if (!/^(v([1-9][6-9]+\.)?(\d+\.)?(\d+))$/.test(process.version)) {
    throw new Error(
        `Hylybot and its key repository Discord.js requires Node v16.x or higher to run. You have v${process.version}.\nPlease upgrade your Node installation.`
    );
}



/**
 * Retrieve a configuration value stored on Hylybot's MongoDB database.
 * @param str Value to retrieve.
 * @returns Configuration value.
 */
export async function getDbConfig(str: string): Promise<any> {
    let res = await Bot.db.collection("hybot").findOne({ item: str });
    return res.value;
}

Bot.on("interactionCreate", async (interaction) => {
    if (Bot.config.DEV_MODE && !Bot.config.OWNER_ID.includes(interaction.user.id)) return;

    if (interaction.isButton()) {
        let profileButtonID = [
            "viewPride",
            "gay",
            "les",
            "bi",
            "pan",
            "ace",
            "aro",
            "trans",
            "enby",
            "agender",
            "gq",
            "catgender",
            "ally",
            "nd",
            "furry",
            "clearPride",
            "clearGenshin",
            "clearFC",
            "clearMC",
            "clearFortnite",
            "clearTag",
            "create",
        ];
        if (
            interaction.customId == "preCol" ||
            interaction.customId == "reassign"
        ) {
            let command = Bot.commands.get("role");
            command.run.execute(interaction, Bot.db);
        }
        if (profileButtonID.includes(interaction.customId)) {
            let command = Bot.commands.get("profile");
            command.run.execute(interaction, Bot.db);
        }
    }
    if (interaction.isCommand()) {
        const command = Bot.commands.get(interaction.commandName);
        if (!command) return;

        try {
            command.run.execute(interaction, Bot.db);
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: `There was an error while executing this command! \`${error}\``,
                ephemeral: true,
            });
        }
    }
});

// manager.on("starboardReactionAdd", async (emoji, message, user) => {
//   let locked: boolean = await getDbConfig("starboardLock")

//   if (emoji == "star" && locked) {
//     message.channel.send(`<@!${user.id}>, the starboard is locked. New stars cannot be added to this message.`)
//   }
// })

// Check if it's someone's birthday, and send a message at midday UTC time
import birthdayCheck from "./loops/birthdayCheck";
setInterval(async () => {
    await birthdayCheck(Bot.db, Bot);
}, 3600000);

import streamCheck from "./loops/streamCheck";
setInterval(async () => {
    await streamCheck(Bot.db, Bot);
}, 60000);

// import OzAlertFetch from "./loops/ozalert"
// setInterval(async () => await OzAlertFetch(bot), 60000)
import fs from 'fs';
import { jsonc } from 'jsonc';
let configData = fs.readFileSync("./data/config.jsonc", "utf8");
let config = jsonc.parse(configData);
Bot.start(config.BOT_TOKEN);
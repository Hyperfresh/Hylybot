import { REST } from "@discordjs/rest";
import { Client, Collection, Intents } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import { env } from "process";
import { Routes } from "discord-api-types/v9";

config();

const logo = `|__|    |    |_   _  _|_   =\\\\\\/‾‾.‾\\\n|  | \\/ | \\/ |_| |_|  |    =///\\__._/\n     /    /\n`;

// |__|    |    |_   _  _|_   =\\\/‾‾.‾\
// |  | \/ | \/ |_| |_|  |    =///\__._/
//      /    /

const credits = `
Hylybot Next - the custom-built Discord bot for the Hyla + Friends server.
Copyright (C) 2022 Hyla A | https://github.com/Hyperfresh/Hylybot

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
`;

console.log(logo, credits);

// Check env variables...
const TOKEN: string = env.BOT_TOKEN ? env.BOT_TOKEN : "";
const CLIENT: string = env.CLIENT_ID ? env.CLIENT_ID : "";
const GUILD: string = env.GUILD_ID ? env.GUILD_ID : "";

if ([TOKEN, CLIENT, GUILD].includes(""))
  throw new Error("One of your environment variables are missing.");

// Create bot object.
const bot: Client = new Client({
  retryLimit: 5,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

// Load commands from directories and into memory.
const commandList: Collection<any, any> = new Collection();
let commandJsonList: Array<JSON> = [];
fs.readdir("./build/commands/", { withFileTypes: true }, (error, items) => {
  if (error) throw error;
  items.forEach((item) => {
    if (item.isDirectory()) {
      fs.readdir(`./build/commands/${item.name}/`, (err, subItems) => {
        if (err) throw err;
        subItems.forEach((subItem) => {
          if (!subItem.endsWith(".js"))
            return console.warn(`⚠️ > Ignoring item ${item.name}/${subItem}.`);
          let command = require(`./commands/${item.name}/${subItem}`);
          let commandJson = command.data.toJSON()
          commandList.set(commandJson.name, command);
          commandJsonList.push(commandJson);
          console.log(`📥 > Loaded ${item.name}/${subItem}.`);
        });
      });
    } else {
      if (!item.name.endsWith(".js"))
        return console.warn(`⚠️ > Ignoring item ${item.name}.`);
      let command = require(`./commands/${item.name}`);
      let commandJson = command.data.toJSON()
      commandList.set(commandJson.name, command);
      commandJsonList.push(commandJson);
      console.log(`📥 > Loaded ${item.name}.`);
    }
  });
});

bot.on("shardReady", async () => {
  // Push commands into a JSON file.
  console.log("ℹ️ > Pushing commands to Discord...");
  const rest = new REST({ version: "9" }).setToken(TOKEN);
  await rest
    .put(Routes.applicationGuildCommands(CLIENT, GUILD), {
      body: commandJsonList,
    })
    .then(() => {
      console.log(`📮 > Commands pushed.`);
    })
    .catch((err) => {
      throw err;
    });

    console.log(`✅ > ${bot.user?.tag} is now online.`)
    if (env.DEV_MODE) {
        bot.user?.setPresence({activities: [{name: "to Hyla's commands 🔧 ", type: "LISTENING"}], status: "dnd"})
        console.warn(`⚠️ > Developer Mode is active. I will only respond to commands from the owners listed in your .env file.`)
    } else {
        bot.user?.setPresence({activities: [{name: "for /", type: "WATCHING"}], status: "online"})
    }
});

bot.on("interactionCreate", async (interaction) => {
    if (env.DEV_MODE && !env.OWNERS?.includes(interaction.user.id)) return

    if (interaction.isCommand()) {
        const command = commandList.get(interaction.commandName);
        if (!command) return;
    
        try {
          command.execute(interaction);
        } catch (error) {
          console.error(error);
          interaction.reply({
            content: `There was an error while executing this command! \`${error}\``,
            ephemeral: true,
          });
        }
      }
})

bot.login(TOKEN)
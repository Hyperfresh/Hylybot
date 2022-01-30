var copy = String(`
Hylybot - yet another custom Discord bot, built in TypeScript
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

import * as Discord from "discord.js";
const bot: Discord.Client = new Discord.Client({
  retryLimit: 5,
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});
const commands: Discord.Collection<any, any> = new Discord.Collection();

import * as fs from "fs";

import { jsonc } from "jsonc";
let configData = fs.readFileSync("./data/config.jsonc", "utf8");
let config = jsonc.parse(configData);
export { config };

import { MongoClient } from "mongodb";
const url = config.MONGO_URL,
  dbName = config.MONGO_DBNAME;

import ready from "./events/ready";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

let commandsToPush = [];

fs.readdir("./build/commands/", { withFileTypes: true }, (error, f) => {
  if (error) return console.error(error);
  f.forEach((f) => {
    if (f.isDirectory()) {
      fs.readdir(`./build/commands/${f.name}/`, (error, fi) => {
        if (error) return console.error(error);
        fi.forEach((fi) => {
          if (!fi.endsWith(".js")) return;
          let commande = require(`./commands/${f.name}/${fi}`);
          commands.set(commande.help.name, commande);
          commandsToPush.push(commande.run.data.toJSON());
          console.log(`Loaded ${f.name}/${fi}.`);
        });
      });
    } else {
      if (!f.name.endsWith(".js")) return;
      let commande = require(`./commands/${f.name}`);
      commands.set(commande.help.name, commande);
      commandsToPush.push(commande.run.data.toJSON());
      console.log(`Loaded ${f.name}.`);
    }
  });
});

bot.on("shardReady", async () => {
  console.log(`✅ > ${bot.user.username} is ready for action!`);
  await ready(bot, config.DEV_MODE);

  // Push commands...
  const rest = new REST({ version: "9" }).setToken(config.BOT_TOKEN);
  await rest
    .put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
      body: commandsToPush,
    })
    .then(() => {
      console.log("Pushed commands.")
    })
    .then(() => {
      console.log("Attempting to set permissions...")
      setTimeout(async () => {
        let guild = bot.guilds.cache.find((val) => val.id == config.GUILD_ID);
        let commandos = guild.commands.fetch();
        (await commandos).forEach((item) => {
          console.log(`Setting permissions for command ${item.name}...`)
          switch (item.name) {
            case "bot":
              item.setDefaultPermission(false);
              let perms = []
              config.OWNER_ID.forEach((user) => {
                perms.push({ id: user, type: "USER", permission: true })
                console.log(
                  `Adding permission for user ${user}...`
                );
              });
              item.permissions.set({permissions: perms})
              console.log(`Set permissions for ${item.name}.`)
              break;
            }
          })
      }, 3000)
    })
    .catch(console.error);
});

bot.on("interactionCreate", async (interaction) => {
  let mongod = await MongoClient.connect(url);
  let db = mongod.db(dbName);

  if (config.DEV_MODE && !config.OWNER_ID.includes(interaction.user.id)) return;

  if (interaction.isButton()) {
    let profileButtonID = [
      "viewPride",
      "gay",
      "lesbian",
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
      let command = commands.get("role");
      command.run.execute(interaction, db);
    }
    if (profileButtonID.includes(interaction.customId)) {
      let command = commands.get("profile");
      command.run.execute(interaction, db);
    }
  }
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      command.run.execute(interaction, db);
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: `There was an error while executing this command! \`${error}\``,
        ephemeral: true,
      });
    }
  }
});

// Check if it's someone's birthday, and send a message at 7am server time
import birthdayCheck from "./loops/birthdayCheck";
import { setTimeout } from "timers";
setInterval(async () => {
  let mongod = await MongoClient.connect(url);
  let db = mongod.db(dbName);
  await birthdayCheck(db, bot);
}, 3600000);

// import OzAlertFetch from "./loops/ozalert"
// setInterval(async () => await OzAlertFetch(bot), 60000)

bot.login(config.BOT_TOKEN);

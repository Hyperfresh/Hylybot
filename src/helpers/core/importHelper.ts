import { Collection } from "discord.js";
import fs from "fs";

export default function importCommands(commandList: Collection<any, any>) {
  let commandJsonList: Array<JSON> = [];
  fs.readdir("./build/commands/", { withFileTypes: true }, (error, items) => {
    if (error) throw error;
    items.forEach((item) => {
      if (item.isDirectory()) {
        fs.readdir(`./build/commands/${item.name}/`, (err, subItems) => {
          if (err) throw err;
          subItems.forEach((subItem) => {
            if (!subItem.endsWith(".js"))
              return console.warn(
                `⚠️ > Ignoring item ${item.name}/${subItem}.`
              );
            let command = require(`../../commands/${item.name}/${subItem}`);
            let commandJson = command.data.toJSON();
            commandList.set(commandJson.name, command);
            commandJsonList.push(commandJson);
            console.log(`📥 > Loaded ${item.name}/${subItem}.`);
          });
        });
      } else {
        if (!item.name.endsWith(".js"))
          return console.warn(`⚠️ > Ignoring item ${item.name}.`);
        let command = require(`../../commands/${item.name}`);
        let commandJson = command.data.toJSON();
        commandList.set(commandJson.name, command);
        commandJsonList.push(commandJson);
        console.log(`📥 > Loaded ${item.name}.`);
      }
    });
  });
  return commandJsonList
}

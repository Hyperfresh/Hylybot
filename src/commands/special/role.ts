// Tweaked from the Custom Role system in CAutomator.
// Thanks to http://github.com/iwa for the original code!

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { Db } from "mongodb";

const colourButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Use a colour picker")
    .setURL("https://duckduckgo.com/?q=color+picker&ia=answer")
    .setStyle("LINK"),
  new MessageButton()
    .setLabel("View pre-defined colours")
    .setCustomId("preCol")
    .setStyle("SECONDARY")
);

const reassignButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Re-assign my custom role")
    .setCustomId("reassign")
    .setStyle("PRIMARY")
);

const colours = [
  { name: "red", hex: "ff0000" },
  { name: "orange", hex: "e67e22" },
  { name: "yellow", hex: "f1c40f" },
  { name: "purple", hex: "9b59b6" },
  { name: "lime", hex: "2ecc71" },
  { name: "green", hex: "1f8b4c" },
  { name: "aqua", hex: "00d6ff" },
  { name: "blue", hex: "3498db" },
  { name: "darkBlue", hex: "0012c3" },
  { name: "magenta", hex: "ff008f" },
  { name: "pink", hex: "ff7ee7" },
  { name: "white", hex: "ffffff" },
  { name: "black", hex: "000000" },
  { name: "grey", hex: "95a5a6" },
  { name: "ninja", hex: "36393e" },
  { name: "blurpleOld", hex: "7289da" },
  { name: "blurpleNew", hex: "5865f2" },
];

module.exports.run = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Set a custom role name and colour for this server.")

    .addSubcommand((subCommand) =>
      subCommand
        .setName("edit")
        .setDescription("Edit your existing custom role.")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("Which item would you like to edit?")
            .setRequired(true)
            .addChoice("Role name", "role_name")
            .addChoice("Role colour", "role_colour")
        )
        .addStringOption((option) =>
          option
            .setName("value")
            .setDescription("This would be your role name, or hex colour.")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("create")
        .setDescription("Create a new custom role.")
        .addStringOption((option) =>
          option
            .setName("role_name")
            .setDescription("The name of your new role.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("role_colour")
            .setDescription("The colour of your new role.")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand.setName("remove").setDescription("Removes your custom role.")
    ),
  async execute(interaction: any, db: Db) {
    if (interaction.isButton()) {
      await interaction.deferUpdate()
      if (interaction.customId == "preCol") {
        let response = [];
        colours.forEach(item => {
          response.push(` ${item.name}`)
        })
        await interaction.editReply(`**Pre-defined colours**:${response.toString()}`)
      } else { // assume re-assign
        let reassign = await db
        .collection("roles")
        .findOne({ user: interaction.user.id });
        await interaction.member.roles.add(reassign.role);
        await interaction.editReply({content: `Your role was reassigned: <@&${reassign.role}>`})
      }
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    let rolecolour;
    let __FOUND;
    let search = await db
      .collection("roles")
      .findOne({ user: interaction.user.id });
    switch (interaction.options.getSubcommand()) {
      case "create": // Create a role
        if (search) {
          interaction.editReply({
            content:
              "You already have a custom role! Did you want to try re-assigning it?",
            components: [reassignButton],
          });
          return;
        }
        if (
          !/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(
            interaction.options.getString("role_colour")
          )
        ) {
          __FOUND = colours.find(function (colour) {
            if (colour.name == interaction.options.getString("role_colour"))
              return true;
          });
          if (__FOUND) {
            rolecolour = __FOUND.hex;
          } else {
            interaction.editReply({
              content:
                "The colour you provided was wrong. It must be provided as a hex code, such as `#123abc`, or a pre-defined colour such as `red`.\n\n*Need help choosing a colour? Try one of the buttons below.*",
              components: [colourButton],
            });
            return;
          }
        } else {
          if (interaction.options.getString("role_colour").charAt(0) == "#")
            rolecolour = interaction.options
              .getString("role_colour")
              .substring(1);
          else rolecolour = interaction.options.getString("role_colour");
        }
        interaction.guild.roles
          .create({
              name: interaction.options.getString("role_name"),
              color: rolecolour,
              hoist: false,
              position: 26
          })
          .then((role) => {
            const data = {user: String(interaction.user.id), role: String(role.id)}
            db.collection("roles").insertOne(data)
            interaction.member.roles.add(role.id);
            interaction.editReply(
              `Your custom role was created: <@&${role.id}>`
            );
          })
          .catch(console.error);
        break;
      case "edit": // Edit a role
        if (!search) {
          interaction.editReply(
            "You don't have a custom role! You may want to create one."
          );
          return;
        }
        if (interaction.options.getString("item") == "role_name") {
          // Edit role name
          interaction.guild.roles
            .fetch(search.role)
            .then((role) => {
              role.edit({ name: interaction.options.getString("value") });
              interaction.editReply(
                `Your custom role's name was edited: <@&${role.id}>`
              );
            })
            .catch(console.error);
        } else {
          if (
            !/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(
              // Edit role colour
              interaction.options.getString("value")
            )
          ) {
            __FOUND = colours.find(function (colour) {
              if (colour.name == interaction.options.getString("value"))
                return true;
            });
            if (__FOUND) {
              rolecolour = __FOUND.hex;
            } else {
              interaction.editReply({
                content:
                  "The colour you provided was wrong. It must be provided as a hex code, such as `#123abc`.\n\n*Need help choosing a colour? Try one of the buttons below.*",
                components: [colourButton],
              });
              return;
            }
          } else {
            if (interaction.options.getString("value").charAt(0) == "#")
              rolecolour = interaction.options.getString("value").substring(1);
            else rolecolour = interaction.options.getString("value");
          }
          interaction.guild.roles
            .fetch(search.role)
            .then((role) => {
              role.edit({ color: rolecolour });
              interaction.editReply(
                `Your custom role's colour was edited: <@&${role.id}>`
              );
            })
            .catch(console.error);
        }
        break;
      case "remove": // Delete a role
        await interaction.member.roles.remove(search.role);
        await db.collection("roles").deleteOne({ user: interaction.user.id });
        interaction.editReply(
          `Your custom role was removed and deleted. Create a new one at any time.`
        );
        break;
    }
  },
};

module.exports.help = {
  name: "role",
  usage: "Set a custom role",
};

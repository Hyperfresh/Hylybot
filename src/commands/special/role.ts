// Tweaked from the Custom Role system in CAutomator.
// Thanks to http://github.com/iwa for the original code!

import { SlashCommandBuilder } from "@discordjs/builders";

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
            .addChoice("Role name", "name")
            .addChoice("Role colour", "colour")
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
        .setName("colour")
        .setDescription("Sets your role colour.")
        .addStringOption((option) =>
          option.setName("role_colour").setDescription("Role colour in hex.")
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
            .setName("colour")
            .setDescription("The colour of your new role.")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand.setName("remove").setDescription("Removes your custom role.")
    ),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case "create":
                break
            case "edit":
                break
            case "remove":
                break
        }
    }
};

module.exports.help = {
    name: "role",
    usage: "(NYI)"
}
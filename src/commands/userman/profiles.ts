import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { Profile } from "../../helpers/profile/embedHelper";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Profile management.")
    .addSubcommand((cmd) =>
      cmd
        .setName("view")
        .setDescription("View someone's profile.")
        .addUserOption((opt) =>
          opt
            .setName("who")
            .setDescription(
              "Whose profile? Shows yours by default, if you have one."
            )
            .setRequired(false)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("clear")
        .setDescription("Delete something from your profile.")
        .addStringOption((opt) =>
          opt
            .setName("what")
            .setDescription("What would you like to delete?")
            .setRequired(true)
            .setChoices(
              { name: "💥 CLEAR EVERYTHING", value: "all" },
              { name: "Name", value: "name" },
              { name: "Birthday", value: "bday" },
              { name: "Age", value: "age" },
              { name: "Gametags", value: "gametag" },
              { name: "Timezone", value: "tz" }
            )
        )
    )
    .addSubcommandGroup((grp) =>
      grp
        .setName("edit")
        .setDescription("Edit something from your profile.")
        .addSubcommand((cmd) =>
          cmd
            .setName("name")
            .setDescription(
              "Set your IRL name, so we know who you are in person!"
            )
            .addStringOption((opt) =>
              opt
                .setName("what")
                .setDescription(
                  'So, what IS your name? Preferred format: "Hyla A"'
                )
                .setRequired(true)
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("bday")
            .setDescription("Set your birthday.")
            .addIntegerOption((opt) =>
              opt
                .setName("day")
                .setDescription("The day you were born.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(31)
            )
            .addStringOption((opt) =>
              opt
                .setName("month")
                .setDescription("The month you were born.")
                .setRequired(true)
                .addChoices(
                  { name: "January", value: "Jan" },
                  { name: "February", value: "Feb" },
                  { name: "March", value: "Mar" },
                  { name: "April", value: "Apr" },
                  { name: "May", value: "May" },
                  { name: "June", value: "Jun" },
                  { name: "July", value: "Jul" },
                  { name: "August", value: "Aug" },
                  { name: "September", value: "Sep" },
                  { name: "October", value: "Oct" },
                  { name: "November", value: "Nov" },
                  { name: "December", value: "Dec" }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("age")
            .setDescription("Set your age.")
            .addIntegerOption((opt) =>
              opt
                .setName("age")
                .setDescription("Set your age.")
                .setRequired(true)
            )
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    let subcmd: string;
    // Check if option is a subcommand group or not
    try {
      subcmd = interaction.options.getSubcommandGroup(true);
    } catch {
      subcmd = interaction.options.getSubcommand(true);
    }
    switch (subcmd) {
      case "view":
        await interaction.deferReply();
        // Get user, if any. Otherwise, get user who initiated interaction
        let user: User = interaction.options.getUser("who")
          ? interaction.options.getUser("who", true)
          : interaction.user;

        // Create profile
        let profileView = new Profile(user);

        // Send profile
        return profileView.send(interaction);

      case "edit":
        await interaction.deferReply({ ephemeral: true });

        let profileEdit = new Profile(interaction.user);

        // Get item to edit
        switch (interaction.options.getSubcommand(true)) {
          case "name":
            await profileEdit.update(
              "name",
              interaction.options.getString("what")
            );
            return profileEdit.send(interaction, "Your name has been updated.");
          case "bday":
            // get birthday and age variables
            let bday = interaction.options.getString("birthday");
            let age = interaction.options.getInteger("age");

            if (!bday && !age)
              return interaction.editReply("Please provide at least 1 item.");

            if (bday) {
              // Birthday Checking: /^((31(?!\ (Feb(ruary)?|Apr(il)?|June?|(Sep(?=\b|t)t?|Nov)(ember)?)))|((30|29)(?!\ Feb(ruary)?))|(29(?=\ Feb(ruary)?\ (((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)))))|(0?[1-9])|1\d|2[0-8])\ (Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Ju((ly?)|(ne?))|Aug(ust)?|Oct(ober)?|(Sep(?=\b|t)t?|Nov|Dec)(ember)?)$/

              let ddmm = bday.split("-");
              if ((ddmm[1] = "")) return;
              await profileEdit.update("bday", 0);
            }
        }
    }
  },
};

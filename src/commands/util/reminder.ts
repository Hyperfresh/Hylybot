import {MessageEmbed} from "discord.js"

const BadTime = new MessageEmbed()
    .setTitle("Sorry, I don't understand.")
    .setDescription("This looks like an invalid time.")
    .setFooter({text: "Did you format the time properly?"})
const TooLong = new MessageEmbed()
    .setTitle("Sorry, I can't do that.")
    .setDescription("I struggle with reminders set further than a year. Consider using a calendar instead.")
    .setFooter({text: "Let's try not create memory problems, shall we?"})

const BadDMs = new MessageEmbed()
    .setTitle("It looks like you're trying to set a reminder. Can I help?")
    .setDescription("Your DMs are closed. Reminders won't work without them open.")
    .setFooter({text: "If you'd rather keep them closed, consider using a calendar instead."})


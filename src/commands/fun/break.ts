import { SlashCommandBuilder } from "@discordjs/builders"

let breakMessages = [
    'oh no you have broken me!',
    'Oh no, hairpins busted',
    "'JHsfhishi28778878v...'''s''df'4'4'433'101011011001'",
    "oh no, now my brain has turned into mash potat",
    "Have a break, have a Kit Kat."
]

module.exports.run = {
    data: new SlashCommandBuilder()
    .setName("break")
    .setDescription("I'm looking at you, Octolili."),
    async execute(interaction) {
        let item = Math.random() * 4
        interaction.reply(`${breakMessages[item.toFixed(0)]}`)
    }
}

module.exports.help = {
    name: "break",
    usage: "/break",
    desc: "I'm looking at you, Octolili."
}
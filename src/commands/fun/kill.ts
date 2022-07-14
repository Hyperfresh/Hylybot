import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, User } from "discord.js";

function killMessage(user: User, target: User): string {
    let messages = [ // All messages are submitted by Lilijana M unless noted otherwise
        `<@!${user.id}> pushed <@!${target.id}> off a cliff to their death`,
        `<@!${target.id}> caught a cold and died`,
        `<@!${user.id}> fought <@!${target.id}> to the death and won!`,
        `<@!${user.id}> dropped a piano on <@!${target.id}>'s head, killing them dead`,
        `<@!${target.id}> experienced kinetic energy`,
        `<@!${target.id}> died of shame after revealing themself to secretly be a dream stan`,
        `<@!${target.id}> hit the ground too hard, what a loser`,
        `<@!${target.id}> was impaled on a stalagmite`,
        `<@!${target.id}> tried to swim in lava; what an idiot`,
        `<@!${user.id}> ran <@!${target.id}> over in their car. Haha dead.`,
        `<@!${target.id}> was the poor victim of <@!${user.id}>'s hit and run`,
        `<@!${target.id}> choked on an olive and died`,
        `<@!${user.id}> 360 no-scoped <@!${target.id}> and teabagged them before respawn`,
        `<@!${user.id}> tried to shoot <@!${target.id}> point blank, but it backfired and <@!${user.id}> died instead!`,
        `<@!${target.id}> ok you're dead now I guess`,
        `<@!${user.id}> farted and the smell was so bad that <@!${target.id}> died`,
        `<@!${target.id}> was invited to <@!${user.id}>'s place for dinner, but the food was secretly poisoned and they died!`,
        `<@!${user.id}> gave <@!${target.id}> covid—but they survived thanks to being vaccinated!`,
        `<@!${target.id}> pissed their pants and died`,
        `<@!${target.id}> lived the American dream. They had an idea, and turned their idea into a wonderful business venture, met the love of their life, got married, had 2 children and a dog, bought a 4 wheel drive and a big flatscreen TV, lived a good life and retired at the age of 65 to play golf and visit the grandkids and died at the ripe old age of 92.`,
        `<@!${user.id}> tied <@!${target.id}> shoelaces together when they weren't looking, and when they tried to walk they tripped and fell into a tank of acid and died!`,
        `<@!${user.id}> pushed <@!${target.id}> into an industrial meat grinder where they met a gruesome, gory death and got turned into ground meat. They're on special at woollies this week!`,
        `<@!${target.id}> fell out of the world`,
        `<@!${target.id}> died`,
        `<@!${user.id}> stabbed <@!${target.id}> to death with a kitchen knife!`,
        `<@!${user.id}> tried to kill <@!${target.id}>—but they had a uno reverse card and killed <@!${user.id}> instead!`,
        `<@!${user.id}> tried to murder <@!${target.id}>, but <@!${target.id}> said 'no' and survived, because <@!${user.id}> cannot legally murder <@!${target.id}> without their consent.`,
        `<@!${user.id}> ratio'd <@!${target.id}> and died. L, no bitches, you died`, // Submitted by David R
        `<@!${user.id}> forced <@!${target.id}> to get a perfect on Remix 8`, // Submitted by David R
        `<@!${user.id}> banged <@!${target.id}>'s mum lol`, // Submitted by Zoe H
        `<@!${user.id}> clawed at <@!${target.id}>`, // Submitted by David R
        `<@!${target.id}> died from accidentally drinking expired milk`,
        `<@!${target.id}> ate one too many pop tarts and died`,
        `<@!${target.id}> drank too much pilk and died`, // Submitted by David R
        `<@!${user.id}> picked <@!${target.id}>'s mario party main`, // Submitted by Zoe H
        `<@!${user.id}> just got <@!${target.id}> luigi'd and couldn't handle Luigi's presence`, // Submitted by David R
        `<@!${user.id}> convinced <@!${target.id}> to go down a sewer slide.`, // Submitted by Hyla A
        `<@!${user.id}> hurled <@!${target.id}> into the sun` // Submitted by David R
    ];
    let item: number = Math.random() * (messages.length - 1);
    return messages[Math.round(item)];
}

module.exports.run = {
    data: new SlashCommandBuilder()
        .setName("kill")
        .setDescription("Commit a murder.")
        .addUserOption(opt => opt.setName("who").setDescription("Who do you want to murder?").setRequired(true)),
    async execute(interaction: CommandInteraction) {
        let user: User = interaction.user;
        let targ: User = interaction.options.getUser("who", true);
        interaction.reply(killMessage(user, targ));
    }
};

module.exports.help = {
    name: "kill",
    usage: "/kill <user>",
    desc: "Murder.",
};
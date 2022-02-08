import { Message } from "discord.js";
import { config } from "..";

let cooldownMsg: Map<string, number> = new Map();

export default class cooldown {

    /**
     * Message cooldown handler (for anti-spam purpose)
     * Automatically mutes the spammer if a spam is detected
     * @param msg - Message object
     */
    static async message(msg: Message) {
        if (!cooldownMsg.has(msg.author.id)) {
            cooldownMsg.set(msg.author.id, 1);
            setTimeout(async () => { cooldownMsg.delete(msg.author.id) }, 2500)
        } else
            cooldownMsg.set(msg.author.id, (cooldownMsg.get(msg.author.id)+1));

        if (cooldownMsg.get(msg.author.id) == 4)
            return msg.reply({ embeds: [{ "title": `**Please don't spam, ${msg.author.username}.**`, "color": 13632027 }] })
        else if (cooldownMsg.get(msg.author.id) == 6) {
            await msg.member.roles.add(config.MUTED_ID)
            await msg.reply({ embeds: [{ "title": `**Okay ${msg.author.username}, time to chill out.**`, "description": "Take a break for five minutes, then come back.", "color": 13632027 }] })
            setTimeout(async () => {
                return msg.member.roles.remove(config.MUTED_ID)
            }, 300000);
        }
    }
}
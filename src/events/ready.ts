/**
 * "Ready" function which is executed every time the bot starts.
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */

import { Client } from "discord.js";

/**
 * - Sets the bot activity and does initial boot.
 * - Sets up the cache required for reaction roles and whatnot.
 * - Sets up required commands as part of the new Discord Slash Command protocol.
 * @param {Client} bot - Discord client object.
 * @param dev - Boot up the bot in Developer mode.
 */

export default async function ready(bot: Client, dev: boolean) {
    if (dev) {
        bot.user.setActivity("⚠️ DEV MODE", { type: "PLAYING" });
        bot.user.setStatus("dnd");
        console.warn("Developer Mode is active!");
        return;
    }
    bot.user.setActivity("for /", { type: "WATCHING" });
    bot.user.setStatus("online");
}

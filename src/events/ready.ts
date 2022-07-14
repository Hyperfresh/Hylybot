/**
 * "Ready" function which is executed every time the bot starts.
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */

import Bot from '../Bot';

/**
 * - Sets the bot activity and does initial boot.
 * - Sets up the cache required for reaction roles and whatnot.
 * - Sets up required commands as part of the new Discord Slash Command protocol.
 * @param {Client} bot - Discord client object.
 * @param dev - Boot up the bot in Developer mode.
 */

export default async function ready(dev: boolean) {
    if (dev) {
        Bot.user?.setActivity("⚠️ DEV MODE", { type: "PLAYING" });
        Bot.user?.setStatus("dnd");
        console.warn("Developer Mode is active!");
        return;
    }
    Bot.user?.setActivity("for /", { type: "WATCHING" });
    Bot.user?.setStatus("online");
}

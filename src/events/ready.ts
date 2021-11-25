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
 */

export default async function ready(bot: Client) {
  bot.user.setActivity("for /", { type: "WATCHING" });
  bot.user.setStatus("online");
}

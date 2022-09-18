import { Client, EmbedBuilder, version } from "discord.js";
import { Duration, DurationObjectUnits } from "luxon";
import process, { memoryUsage } from "process";
import os from "os"
import { versionMajorMinor } from "typescript";

export function displayBotDetails(client: Client) {
  let botUptime: DurationObjectUnits = Duration.fromMillis(client.uptime ? client.uptime : 0).shiftTo("days", "hours", "minutes", "seconds").toObject()
  let engUptime: DurationObjectUnits = Duration.fromMillis(process.uptime() * 1000).shiftTo("days", "hours", "minutes", "seconds").toObject()
  let srvUptime: DurationObjectUnits = Duration.fromMillis(os.uptime() * 1000).shiftTo("days", "hours", "minutes", "seconds").toObject()

  return new EmbedBuilder()
    .setTitle(`Hylybot`)
    .setDescription(
      "I'm a Discord bot, open-source and custom-built to help with various tasks for the Hyla + Friends server."
    )
    .addFields([
        {name: "Uptime", value: `**Bot**: ${botUptime.days}d ${botUptime.hours}h ${botUptime.minutes}m ${botUptime.seconds}s\n**Engine**: ${engUptime.days}d ${engUptime.hours}h ${engUptime.minutes}m ${engUptime.seconds}s\n**Server**: ${srvUptime.days}d ${srvUptime.hours}h ${srvUptime.minutes}m ${srvUptime.seconds}s`},
        {name: "Memory", value: `**Engine**: ${memoryUsage().heapUsed / 1e6}MB used/${memoryUsage().heapTotal / 1e6}MB total\n**Server**: ${(os.totalmem() - os.freemem()) / 1e9}GB used/${os.totalmem() / 1e9}GB total`},
        {name: "Specifications", value: `**Bot**: Discord.js v${version}\n**Engine**: Node.js v${process.version} w/ TypeScript v${versionMajorMinor}\n**Server**: ${os.platform()} ${os.release()} ${os.arch()} ${os.version()}`}
    ])
}

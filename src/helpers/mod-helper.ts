import { Collection, Message, MessageEmbed, User } from "discord.js";
import { config, bot } from "..";

/**
 * A helper library for logging moderation actions.
 * @packageDocumentation
 * @module LogHelper
 * @category Helpers
 */
export default class LogAction {
  /**
   * Fetches the configuration for the moderation log channel and associated moderation roles.
   * @returns modlog, modrole
   */
  public static async fetchLogConfig() {
    const guild = bot.guilds.cache.find((val) => val.id == config.GUILD_ID);
    const modlog: any = guild.channels.cache.find(
      (val) => val.id == config.MODLOG_ID
    );
    const modrole = config.MODROLE_ID;

    return { modlog, modrole };
  }

  /**
   * Logs a purge event in the modlog.
   * @param action - The user who carried out this event.
   * @param channel - The channel this event occurred in.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param messages - Collection of messages that were purged.
   */
  static async logPurge(
    action: User,
    channel: any,
    timestamp: any,
    messages: Collection<string, Message>
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let log = [];
    let con = messages.sort((A, B) => A.createdTimestamp - B.createdTimestamp);
    con.forEach((message) => {
      log.push(`**${message.author.tag}**: ${message.content}`);
    });

    let act = new MessageEmbed()
      .setTitle(`${log.length} messages purged`)
      .setDescription(
        `**Moderator**: <@!${action.id}>\n**Where**: <#${channel.id}> (\`${channel.id}\`)\n**When**: <t:${timestamp}:f>`
      )
      .setFooter({ text: "Purged message content as follows..." });

    await modlog.send({ content: `**type**: purge`, embeds: [act] });
    try {
      await modlog.send(log.join("\n"));
    } catch (err) {
      console.warn(err);
      await modlog.send(
        `Failed to send purged message content due to the following error: \`\`\`ts\n${err}\`\`\``
      );
    }
  }

  /**
   * Logs a temporary event in the modlog.
   * @param type - The type of event.
   * @param user - The user this event impacts.
   * @param action - The user that carried out this event.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param length - The duration of the event.
   * @param reason - Optional reason as to why this event was carried out.
   */
  static async logTempAction(
    type: "mute" | "ban",
    user: User,
    action: User,
    timestamp: any,
    length?: { time: number; duration: string },
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed();

    switch (type) {
      case "mute":
        act.setTitle("User muted").setColor("#ffc100");
        await ModAction.dm(
          user,
          action,
          "muted",
          `${length.time} ${length.duration}`,
          reason
        );
        break;
      case "ban":
        act.setTitle("User temporarily banned").setColor("#cc0000");
        await ModAction.dm(
          user,
          action,
          "temporaily banned",
          `${length.time} ${length.duration}`,
          reason
        );
        break;
    }
    act.setDescription(
      `**User**: <@!${user.id}> (${user.tag} | \`${user.id}\`)\n**Length**: ${length.time} ${length.duration}\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
    );
    if (reason) act.addField("Reason", reason);

    await modlog.send({ content: `**type**: temp${type}`, embeds: [act] });
  }

  /**
   * Logs an event in the modlog.
   * @param type - The type of event.
   * @param user - The user this event impacts.
   * @param action - The user who carried out this event.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param reason - Optional reason as to why the event was carried out.
   */
  static async logAction(
    type: "mute" | "kick" | "ban" | "softban" | "warn",
    user: User,
    action: User,
    timestamp: any,
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed();

    switch (type) {
      case "mute":
        act.setTitle("User permanently muted").setColor("#ffc100");
        await ModAction.dm(user, action, "muted", "Indefinitely", reason);
        break;
      case "ban":
        act.setTitle("User permanently banned").setColor("#cc0000");
        await ModAction.dm(user, action, "banned", "N/A", reason);
        break;
      case "softban":
        act.setTitle("User softbanned").setColor("#ff00cc");
        await ModAction.dm(user, action, "softbanned", "N/A", reason);
        break;
      case "kick":
        act.setTitle("User kicked").setColor("#ff4700");
        await ModAction.dm(user, action, "kicked", "N/A", reason);
        break;
      case "warn":
        act.setTitle("User warned").setColor("#ffff00");
        await ModAction.dm(user, action, "warned", "N/A", reason);
        break;
    }
    act.setDescription(
      `**User**: <@!${user.id}> (${user.tag} | \`${user.id}\`)\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
    );
    if (reason) act.addField("Reason", reason);

    await modlog.send({ content: `**type**: ${type}`, embeds: [act] });
  }

  /**
   * Logs a lockdown event in the modlog.
   * @param action - The user who carried our this action.
   * @param channel - The channel which was locked down.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param length - Optional length of channel lockdown.
   * @param reason - Optional reason.
   */
  static async logLock(
    action: User,
    channel: any,
    timestamp: any,
    length?: { time: number; duration: string },
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed().setColor("#ffff00");
    if (length) {
      act
        .setTitle(`Channel locked`)
        .setDescription(
          `\n**Where**: <#${channel.id}> (\`${channel.id}\`)\n**Length**: ${length.time} ${length.duration}\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
        );
    } else {
      act
        .setTitle(`Channel permanently locked`)
        .setDescription(
          `\n**Where**: <#${channel.id}> (\`${channel.id}\`)\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
        );
    }
    if (reason) act.addField("Reason", reason);

    await modlog.send({
      content: `**type**: ${length ? "" : "perm"}lock`,
      embeds: [act],
    });
  }

  /**
   * Logs a channel unlock event in the modlog.
   * @param action - The user who carried our this action.
   * @param channel - The channel which was locked down.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param reason - Optional reason.
   */
  static async logUnlock(
    action: User,
    channel: any,
    timestamp: any,
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed()
      .setColor("#00ff00")
      .setTitle("Channel unlocked")
      .setDescription(
        `\n**Where**: <#${channel.id}> (\`${channel.id}\`)\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
      );
    if (reason) act.addField("Reason", reason);

    await modlog.send({ content: "**type**: unlock", embeds: [act] });
  }

  /**
   * Logs a user unmute in the modlog.
   * @param user - The user this event impacts.
   * @param action - The user who carried out this event.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param reason - Optional reason.
   */
  static async logUnmute(
    user: User,
    action: User,
    timestamp: any,
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed()
      .setColor("#00ff00")
      .setTitle("User unmuted")
      .setDescription(
        `**User**: <@!${user.id}> (${user.tag} | \`${user.id}\`)\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
      );
    if (reason) act.addField("Reason", reason);

    await modlog.send({ content: "**type**: unmute", embeds: [act] });
    await ModAction.dm(user, action, "unmuted", "N/A", reason)
  }

  /**
   * Logs a user unban in the modlog.
   * @param user - The user this event impacts.
   * @param action - The user who carried out this event.
   * @param timestamp - The time this event occurred in epoch timestamp format.
   * @param reason - Optional reason.
   */
  static async logUnban(
    user: User,
    action: User,
    timestamp: any,
    reason?: string
  ) {
    const modlog = (await LogAction.fetchLogConfig()).modlog;

    let act = new MessageEmbed()
      .setColor("#00ff00")
      .setTitle("User unbanned")
      .setDescription(
        `**User**: <@!${user.id}> (${user.tag} | \`${user.id}\`)\n**Moderator**: <@!${action.id}>\n**When**: <t:${timestamp}:f>`
      );
    if (reason) act.addField("Reason", reason);

    await modlog.send({ content: "**type**: unban", embeds: [act] });
  }
}

/**
 * A helper library for carrying out moderation actions.
 * @packageDocumentation
 * @module ModHelper
 * @category Helpers
 */
export class ModAction {
  /**
   * Purge messages from a channel.
   * @param interaction Discord command interaction object.
   * @param messageCount How many messages to delete.
   */
  static async purge(interaction: any, messageCount: number) {
    let delMes = await interaction.channel.messages.fetch({
      limit: messageCount,
    });
    await interaction.deferReply({ ephemeral: true });
    await LogAction.logPurge(
      interaction.user,
      interaction.channel,
      (interaction.createdTimestamp / 1000).toFixed(0),
      delMes
    );
    await interaction.channel.bulkDelete(messageCount);
    await interaction.editReply(`Purged ${messageCount} messages.`);
  }

  /**
   * DM a user about an event.
   * @param user - The user to DM.
   * @param action - The user who carried out this event.
   * @param type - The type of event.
   * @param length - The length of this event, if any
   * @param reason - The reason for this event, if any
   */
  static async dm(
    user: User,
    action: User,
    type: string,
    length?: string,
    reason?: string
  ) {
    const guild = bot.guilds.cache.find((val) => val.id == config.GUILD_ID);

    let embed = new MessageEmbed()
      .setAuthor({ name: "Hyla + Friends", iconURL: guild.iconURL() })
      .setTitle(`You were **${type}** from the server.`)
      .setDescription(
        `**Length**: ${length ? length : "Not specified"}\n**Moderator**: ${
          action.username
        }`
      );
    if (reason) embed.addField("Reason", reason);

    try {
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.warn(err);
    }
  }
}

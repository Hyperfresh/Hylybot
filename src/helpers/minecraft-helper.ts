import minecraftPlayer = require("minecraft-player");
import { Db } from "mongodb";
import fs from "fs";

import { load } from "js-yaml";

import { config } from "..";
const userList = require(config.MC_LIST);
const userData = config.MC_DATA;

/**
 * Appends or deletes a Minecraft UUID to a user's server profile.
 * @param {Db} db: Database object
 * @param user: User ID.
 */
export async function updateMinecraft(db: Db, user: string) {
    let value = userList[user];
    if (!value) {
        let result = await db.collection("profiles").findOne({ user: user });
        if (result.gametags.mc == null) {
            await db
                .collection("profiles")
                .updateOne({ user: user }, { $set: { "gametags.mc": null } });
        }
        return -1;
    }

    let mcUser = await minecraftPlayer(value);

    await db
        .collection("profiles")
        .updateOne({ user: user }, { $set: { "gametags.mc": mcUser.uuid } });
    return 0;
}

/**
 * Fetches the Minecraft username and server nickname from a UUID
 * @param uuid - Minecraft User ID.
 * @param hide_nick - [Optional] Hide nickname in returned result.
 */
export async function parseMinecraft(uuid: string, hide_nick?: boolean): Promise<string> {
    let mcUser = await minecraftPlayer(uuid);
    let username = mcUser.username;
    try {
        if (hide_nick) throw new Error;
        let document: any = load(
            fs.readFileSync(`${userData}/${uuid}.yml`, "utf8")
        );
        if (!document.nickname) throw new Error();
        let value = document.nickname;
        let nickname = value.replace(/(§(\d|[xa-f]))/gi, "");
        return `${username} (\`*${nickname}\`)`;
    } catch {
        return username;
    }
}

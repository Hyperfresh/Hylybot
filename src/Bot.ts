import { Collection, Client, Intents } from "discord.js";
import { MongoClient, Db } from "mongodb";
import fs from 'fs';
import { jsonc } from "jsonc";
import ready from "./events/ready";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

export default new class Bot extends Client {
    public config: any;
    public db: Db;

    public commands: Collection<any, any> = new Collection();
    private commandsToPush: any[] = [];

    public constructor() {
        super({
            retryLimit: 5,
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ],
        });
    }

    private async _init() {
        let configData = fs.readFileSync("./data/config.jsonc", "utf8");
        this.config = jsonc.parse(configData);
        console.log('info: config loaded');

        fs.readdir("./build/commands/", { withFileTypes: true }, (error, f) => {
            if (error) return console.error(error);
            f.forEach((f) => {
                if (f.isDirectory()) {
                    fs.readdir(`./build/commands/${f.name}/`, (error, fi) => {
                        if (error) return console.error(error);
                        fi.forEach((fi) => {
                            if (!fi.endsWith(".js")) return;
                            let commande = require(`./commands/${f.name}/${fi}`);
                            this.commands.set(commande.help.name, commande);
                            this.commandsToPush.push(commande.run.data.toJSON());
                            console.log(`Loaded ${f.name}/${fi}.`);
                        });
                    });
                } else {
                    if (!f.name.endsWith(".js")) return;
                    let commande = require(`./commands/${f.name}`);
                    this.commands.set(commande.help.name, commande);
                    this.commandsToPush.push(commande.run.data.toJSON());
                    console.log(`Loaded ${f.name}.`);
                }
            });
        });
        console.log('info: commmands initialized');

        let mongod = await MongoClient.connect(this.config.MONGO_URL);
        this.db = mongod.db(this.config.MONGO_DBNAME);
        console.log('info: database connected');
    }

    public async pushCommands() {
        const rest = new REST({ version: "9" }).setToken(this.config.BOT_TOKEN);
        await rest
            .put(Routes.applicationGuildCommands(this.config.CLIENT_ID, this.config.GUILD_ID), {
                body: this.commandsToPush,
            })
            .then(() => {
                console.log("Pushed commands.");
            });
    }

    public async start(token: string) {
        await this._init();
        await this.login(token);

        this.on("shardReady", async () => {
            console.log(`✅ > ${this.user.username} is ready for action!`);
            await ready(this.config.DEV_MODE);

            await this.pushCommands();
        });
    }
};
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

        fs.readdir("./build/commands/", { withFileTypes: true }, (error, files) => {
            if (error) return console.error(error);
            files.forEach((file) => {
                if (file.isDirectory()) {
                    fs.readdir(`./build/commands/${file.name}/`, (cmdError, files2) => {
                        if (cmdError) return console.error(cmdError);
                        files2.forEach((filee) => {
                            this.importCommand(`${file.name}/${filee}`);
                        });
                    });
                } else {
                    this.importCommand(file.name);
                }
            });
        });
        console.log('info: commmands initialized');

        let mongod = await MongoClient.connect(this.config.MONGO_URL);
        this.db = mongod.db(this.config.MONGO_DBNAME);
        console.log('info: database connected');
    }

    private async importCommand(file: string) {
        if (!file.endsWith(".js")) return;
        let commande = require(`./commands/${file}`);
        this.commands.set(commande.help.name, commande);
        this.commandsToPush.push(commande.run.data.toJSON());
        console.log(`Loaded ${file}.`);
    }

    public async pushCommands() {
        const rest = new REST({ version: "9" }).setToken(this.config.BOT_TOKEN);
        await rest
            .put(Routes.applicationGuildCommands(this.config.CLIENT_ID, this.config.GUILD_ID), {
                body: this.commandsToPush,
            })
            .then(() => {
                console.log("info: pushed commands");
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
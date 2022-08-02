const {Client, Collection, Intents} = require("discord.js");
const {connect, connection: db} = require("mongoose");
const {Routes} = require("discord-api-types/v9");
const {REST} = require("@discordjs/rest");
const {resolve} = require("path");
const {sync} = require("glob");

require("./Interaction");
require("./Event");

module.exports = class Bot extends Client {
    constructor() {
        super({
            intents: Object.values(Intents.FLAGS),
            partials: ["MESSAGE", "REACTION"],
            allowedMentions: {
                parse: ["roles", "users"],
                repliedUser: false,
            },
        });

        this.events = new Collection();
        this.emotes = new Collection();
        this.logger = require("../utils/Logger");
        this.interactions = new Collection();

        this.database = {};
        this.guildsData = require("../models/Guilds");
        this.database.guilds = new Collection();


        db.on("connected", async () =>
            this.logger.log(
                `Connected to the database! (Ping: ${Math.round(await this.databasePing())}ms)`,
                {tag: "Database"}
            )
        );
        db.on("disconnected", () =>
            this.logger.error("Disconnected from the database!", {tag: "Database"})
        );
        db.on("error", (error) =>
            this.logger.error(
                `Unable to connect to the database!\n${
                    error.stack ? error + "\n\n" + error.stack : error
                }`,
                {
                    tag: "Database",
                }
            )
        );
        db.on("reconnected", async () =>
            this.logger.log(
                `Reconnected to the database! (Ping: ${Math.round(
                    await this.databasePing()
                )}ms)`,
                {tag: "Database"}
            )
        );
    }

    async getGuild({_id: guildId}, check = false) {
        if (this.database.guilds.get(guildId)) {
            return check
                ? this.database.guilds.get(guildId).toJSON()
                : this.database.guilds.get(guildId);
        } else {
            let guildData = check
                ? await this.guildsData.findOne({guildID: guildId}).lean()
                : await this.guildsData.findOne({guildID: guildId});
            if (guildData) {
                if (!check) this.database.guilds.set(guildId, guildData);
                return guildData;
            } else {
                guildData = new this.guildsData({_id: guildId});
                await guildData.save();
                this.database.guilds.set(guildId, guildData);
                return check ? guildData.toJSON() : guildData;
            }
        }
    }

    /* Start database */
    async loadDatabase() {
        return connect(process.env.DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    /* Get database ping */
    async databasePing() {
        const cNano = process.hrtime();
        await db.db.command({ping: 1});
        const time = process.hrtime(cNano);
        return (time[0] * 1e9 + time[1]) * 1e-6;
    }

    /* Start database */
    async loadEmotes(guild) {
        if (guild) {
            await guild.emojis.fetch().then(emojis => {

                emojis.forEach(e => {
                    if (e.name.includes("_")) {
                        let name = e.name.replace("_", "-")
                        if(e.animated){
                            this.emotes.set(name, `<${e.identifier}>`);
                        } else{
                            this.emotes.set(name, `<:${e.identifier}>`);
                        }
                    } else {
                        if(e.animated){
                            this.emotes.set(e.name, `<${e.identifier}>`);
                        } else{
                            this.emotes.set(e.name, `<:${e.identifier}>`);
                        }
                    }
                })
            })

        }

    }

    /* Start player */
    async loadPlayer() {
        const player = require("../player/index.js");

        return player(this);
    }


    /* Load slash commands for each guild */
    async loadInteractions(guildId) {
        const intFile = await sync(resolve("./src/commands/**/*.js"));
        intFile.forEach((filepath) => {
            const File = require(filepath);
            if (!(File.prototype instanceof Interaction)) return;
            const interaction = new File();
            interaction.client = this;
            this.interactions.set(interaction.name, interaction);
            const rest = new REST({version: "9"}).setToken(process.env.TOKEN);

            rest.post(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                {
                    body: interaction,
                }
            ).catch((err)=> {
                console.log(err);
            })
        });
    }

    /* Load events */
    async loadEvents() {
        const evtFile = await sync(resolve("./src/events/**/*.js"));
        evtFile.forEach((filepath) => {
            const File = require(filepath);
            if (!(File.prototype instanceof Event)) return;
            const event = new File();
            event.client = this;
            this.events.set(event.name, event);
            const emitter = event.emitter
                ? typeof event.emitter === "string"
                    ? this[event.emitter]
                    : emitter
                : this;
            emitter[event.type ? "once" : "on"](event.name, (...args) =>
                event.exec(...args)
            );
        });
    }

    /* Start the bot */
    async start(token) {
        await this.loadEvents();
        await this.loadDatabase();
        await this.loadPlayer()
        return super.login(token);
    }
};

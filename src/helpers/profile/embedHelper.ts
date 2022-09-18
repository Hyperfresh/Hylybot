import { ChatInputCommandInteraction, Client, Embed, EmbedBuilder, User } from "discord.js";
import { DateTime } from "luxon";
import { ProfilesDB } from "../core/dbHelper";

const db = new ProfilesDB()


/**
 * Hylybot profile object. Takes a user object to create.
 */
export class Profile extends EmbedBuilder {
    private user: User
    private name: string
    private bday: {day: number, month: number} | null
    private age: number
    private timezone: string

    constructor(user: User) {
        super()
    
        // Construct 
        this.user = user
        this.name = ""
        this.bday = null
        this.age = 0
        this.timezone = ""

        db.search(this.user).then((result) => {
            if (!result) {
                // First, set class data
                this.set(this.user.username, null, 0, "")

                db.add(this.user, {
                    user: this.user.id,
                    name: this.user.username,
                    bday: null,
                    age: 0,
                    timezone: ""                    
                })
            }
        })
    }

    /**
     * Set the information for this profile.
     * @param name Name of the user. Can be set to the user's Discord username if real identity is not known.
     * @param bday User's birthday. Can be "null" if user wishes to not provide a birthday.
     * @param age User's age. Can be 0 if user wishes to not provide an age.
     * @param timezone User's timezone. Can be left as an empty string.
     */
    set(name: string, bday: {day: number, month: number} | null, age: number, timezone: string) {
        this.name = name
        this.bday = bday
        this.age = age
        this.timezone = timezone
    }        

    /**
     * Sends this profile to an interaction in the form of an embed.
     * @param interactionToSendTo Interaction to reply with embed to.
     */
    send(interactionToSendTo: ChatInputCommandInteraction, message?: string) {
        // Create embed, use Discord user details
        this.setAuthor({name: this.user.tag, url: `https://discord.com/users/${this.user.id}`})
        .setThumbnail(this.user.avatar)
        .setColor(this.user.accentColor != undefined ? this.user.accentColor : null)
        .setTimestamp()
        .setFooter({text: `🆔 ${this.user.id}`})

        .setTitle(this.name) // Name
        .setDescription(`**Birthday**: ${this.bday} ${this.age != 0 ? `(age ${this.age})` : ""}`)
        
        // Add timezone field if one exists
        if (this.timezone != "") {
            this.addFields([{name: `My current time: ${DateTime.now().setZone(this.timezone).toLocaleString(DateTime.DATETIME_MED)}`, value: `Time zone: ${this.timezone}`}])
        }

        return interactionToSendTo.editReply({content: message, embeds: [this]})
    }

    /**
     * Update the profile.
     * @param data Data to update.
     */
    update(type: "name" | "bday" | "age" | "timezone", data: any) {
        switch (type) {
            case "name":
                return db.update(this.user, {name: data})
            case "bday":
                return db.update(this.user, {bday: data})
            case "age":
                return db.update(this.user, {age: data})
            case "timezone":
                return db.update(this.user, {timezone: data})
        }
    }
}

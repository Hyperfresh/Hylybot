import fetch from "node-fetch";
import { MessageEmbed, Client } from "discord.js";
import { Db } from "mongodb";
import { DateTime } from "luxon";
import { parseStringPromise } from "xml2js";

const config = require('../../data/config')

export default async function bushfireCheck(bot: Client, db: Db) {
    let today = DateTime.now()
    let hh = today.hour

    if (hh == 18) {
        console.log("Checking fire danger ratings...")
        fetch(config.RATINGS_SA)
            .then(res => res.text())
            .then(data => parseStringPromise(data)
            .then(items => {
                let forecastData = items.product.forecast[0]
                for (let x = 1; x <= forecastData.area.length; x++) {
                    let forecast = []
                    forecastData.area[x]["forecast-period"].forEach(item => {
                        
                    })
                }
            })
        )
    }
}
import { Client, MessageEmbed } from "discord.js";
import { MongoClient } from "mongodb";

import * as rssparserlib from "rss-parser";
const rssparser = new rssparserlib();
import { Parser } from "xml2js";
const xmlparser = new Parser();

const config = require("../../data/config");

import * as L from "leaflet";
const leafletImage = require("leaflet-image");

import { DateTime } from "luxon";

// Functions
async function parseAlerts(results) {
  // asynchronous function
  for (let num of results) {
    xmlparser.parseStringPromise(num.content).then(function (result) {
      // First set variables, dates
      let alert = result.div.alert[0].info[0];
      let issued = DateTime.fromISO(result.div.alert[0].sent[0])
        .setZone("Australia/Adelaide")
        .toLocaleString(DateTime.DATETIME_MED);
      let expire = DateTime.fromISO(alert.expires[0])
        .setZone("Australia/Adelaide")
        .toLocaleString(DateTime.DATETIME_MED);
      // Create value to write
      let newAlert = {
        id: 0,
        sent: DateTime.fromISO(result.div.alert[0].sent[0])
          .setZone("Australia/Adelaide")
          .toMillis(), // convert timestamp from RSS into epoch timestamp
        areaDesc: alert.area[0].areaDesc[0],
        level: alert.parameter[2].value[0],
        desc: alert.description[0],
        instruction: alert.instruction[0],
        expires: DateTime.fromISO(alert.expires[0])
          .setZone("Australia/Adelaide")
          .toMillis(),
        map: {
          centre: alert.area[0].circle[0],
          polygon: null,
        },
      };
      try {
        // Does a polygon exist?
        if (alert.area[0].polygon[0]) {
          newAlert.map.polygon = alert.area[0].polygon[0];
        }
      } catch {
        console.log("No polygon");
      }
    });
  }
}

function genPoly(type: string, points, map: L.Map) {
  let polyColour: string;
  switch (type) {
    case "Bushfire Adice":
      polyColour = "yellow";
      break;
    case "Bushfire Watch and Act":
      polyColour = "orange";
      break;
    case "Bushfire Emergency Warning":
      polyColour = "red";
      break;
  }
  L.polygon(points, { color: polyColour }).addTo(map); // Generate polygon from points, use colour decided above, add to map.
}

// Define icons for each level.
var adviceIcon = L.icon({
  iconUrl: "./src/alert-symbols/ico-fire-yellow.png",
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});
var watchactIcon = L.icon({
  iconUrl: "./src/alert-symbols/ico-fire-orange.png",
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});
var emergencyIcon = L.icon({
  iconUrl: "./src/alert-symbols/ico-fire-red.png",
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});
var incidentIcon = L.icon({
  iconUrl: "./src/alert-symbols/fire.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
var updateIcon = L.icon({
  iconUrl: "./src/alert-symbols/update.png",
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});

// Generate map icons for incidents.
function genIcon(type: string) {
  switch (type) {
    case "Update":
      return updateIcon;
    case "Bushfire Advice":
      return adviceIcon;
    case "Bushfire Watch and Act":
      return watchactIcon;
    case "Bushfire Emergency Warning":
      return emergencyIcon;
  }
}

async function createMap(item: any) {
  let lat = item.map.centre.split(",");
  let lon = lat[1].split(" ");
  let mymap = L.map("mapid").setView([lat, lon], 13);
  // Map configuration
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${config.MAP_KEY}`,
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      minZoom: 5,
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: config.MAP_KEY,
    }
  ).addTo(mymap);
  L.marker([lat, lon], {
    icon: genIcon(item.level),
  }).addTo(mymap);
  if (item.map.polygon) {
    let polygon = [];
    let temp;
    let points = item.map.polygon.split(" ");
    for (let value of points) {
      temp = value.split(",");
      polygon.push([temp[0], temp[1]]);
    }
    genPoly(item.level, polygon, mymap);
  }
  return mymap;
}

async function parseAlert(bot: Client, results: any) {
  for (let num of results) {
    xmlparser
      .parseStringPromise(num.content)
      .then(function (result) {
        // First set variables, dates
        let alert = result.div.alert[0].info[0];
        // Create value to write
        return {
          sent: DateTime.fromISO(result.div.alert[0].sent[0])
            .setZone("Australia/Adelaide")
            .toMillis(), // convert timestamp from RSS into epoch timestamp
          areaDesc: alert.area[0].areaDesc[0],
          level: alert.parameter[2].value[0],
          desc: alert.description[0],
          link: alert.web[0],
          instruction: alert.instruction[0],
          expires: DateTime.fromISO(alert.expires[0])
            .setZone("Australia/Adelaide")
            .toMillis(),
          map: {
            centre: alert.area[0].circle[0],
            polygon: null,
          },
        };
      })
      .then(async (alert) => {
        console.log(
          leafletImage(await createMap(alert), function (err, canvas) {
            console.log(canvas);
            const guild = bot.guilds.cache.find(
              (val) => val.id == config.GUILD_ID
            );
            const channel: any = guild.channels.cache.find(
              (val) => val.id == config.ALERT_ID
            );
            const embed = new MessageEmbed()
              .setAuthor(alert.level)
              .setTitle(alert.areaDesc)
              .setURL(alert.link)
              .setDescription(alert.desc)
              .addField("What to do", alert.instruction)
              .addField("This message expires at", `<t:${alert.expires}:f>`)
              // .setImage()
              .setFooter("Powered by OzAlert");
            channel.send(embed)
          })
        );
      });
  }
}

export default async function OzAlertFetch(bot: Client) {
  let RSS_URL = [
    "http://localhost:5500/testfiles/test-2021.xml"
    // "https://data.eso.sa.gov.au/prod/cfs/criimson/cfs_cap_incidents.xml",
    // "https://data.eso.sa.gov.au/prod/mfs/criimson/mfs_cap_incidents.xml",
  ];
  RSS_URL.forEach((url) => {
    console.log("Checking CAP feed", url);
    rssparser.parseURL(url).then(async (res) => {
      try {
        console.log(res.items[0].content);
      } catch {
        console.log("No alerts to show.");
        return;
      }

    });
  });
}

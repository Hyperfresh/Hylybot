import { User } from "discord.js";
import { Collection, Db, MongoClient } from "mongodb";
import { env } from "process";

// Database info
const client: MongoClient = new MongoClient(env.MONGO_URL ? env.MONGO_URL : "")
const db: Db = client.db("hylybot")

/**
 * Represents a database collection within the Hylybot database.
 */
abstract class HyDB {
  private collection: Collection

  constructor(c: Collection) {
    this.collection = c
  }

  /**
   * Search for an entry on the collection.
   * @param user User to search.
   * @returns Document
   */
  search(user: User) {
    return this.collection.findOne({user: user.id})
  }
  
  /**
   * Add a new entry to the collection.
   * @param user User to search.
   * @param data Data to add.
   */
  add(user: User, data: any) {
    return this.collection.insertOne({user: user.id}, data)
  }

  /**
   * Update an entry in the collection.
   * @param user User to search.
   * @param data Data to update.
   */
  update(user: User, data: any) {
    return this.collection.updateOne({user: user.id}, {$set: data})
  }
}

// Collection classes

/**
 * Represents the Profiles database collection.
 */
class ProfilesDB extends HyDB {
  constructor() {
    super(db.collection("profiles"))
  }
}

/**
 * Represents the Roles database collection.
 */
class RolesDB extends HyDB {
  constructor() {
    super(db.collection("roles"))
  }
}


export { ProfilesDB, RolesDB }
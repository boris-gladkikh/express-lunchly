/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  //============ GETTERS / SETTERS =================

  // set numGuests(val) {
  //   if (val < 1) throw new Error("Invalid value!");
  //   this._numGuests = val;
  // }

  // get numGuests() {
  //   return this._numGuests;
  // }

  // set startAt(val) {
  //   if (!(val instanceof Date)) throw new Error("startAt must be Date object!");
  //   this._startAt = val;
  // }

  // get startAt() {
  //   return this._startAt;
  // }

  // set customerId(val) {
  //   if (this._customerId) throw new Error("customerId is already set!");
  //   this._customerId = val;
  // }

  // get customerId() {
  //   return this._customerId;
  // }

  //============ END OF GETTERS / SETTERS ==========

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
           customer_id AS "customerId",
           num_guests AS "numGuests",
           start_at AS "startAt",
           notes AS "notes"
         FROM reservations
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }

  async save() {
    // console.log("this is our this", this)
    console.log("THESE ARE THEM THINGS", this.customerId, this.numGuests, this.startAt, this.notes)
    if (this.id === undefined) {
      let result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,[
          this.customerId, this.numGuests, this.startAt, this.notes
        ]
        
      );
      this.id = result.rows[0].id;
    } else {
      let result = await db.query(
        `UPDATE reservations
        SET customer_id = $1, num_guests = $2, start_at = $3, notes = $4
        WHERE id = $5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;

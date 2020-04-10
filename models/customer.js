/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
         first_name AS "firstName",
         last_name AS "lastName",
         phone,
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
         first_name AS "firstName",
         last_name AS "lastName",
         phone,
         notes
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  //search by customer name - static method
  static async search(searchName) {
    let result = await db.query(
      `SELECT id,
      first_name AS "firstName",
      last_name AS "lastName",
      phone,
      notes
    FROM customers
    WHERE first_name ilike $1 or last_name ilike $1
    ORDER BY last_name, first_name`,
      [searchName]
    );
    if (result.rows.length === 0) {
      const err = new Error(`No customers found matching ${searchName}`);
      err.status = 404;
      throw err;
    } else {
      return result.rows.map((c) => new Customer(c));
    }
  }

  /** find all customers. */

  static async getBest10() {
    const customerResults = await db.query(
      `SELECT c.id,
           c.first_name AS "firstName",
           c.last_name AS "lastName",
           c.phone,
           c.notes,
           COUNT(*) as count
         FROM customers as c
         JOIN reservations as r
         ON c.id = r.customer_id
         GROUP BY c.id
         ORDER BY count DESC
         LIMIT 10`
    );
    return customerResults.rows.map((c) => new Customer(c));
  }
}

// `SELECT id,
//            customer_id AS "customerId",
//            num_guests AS "numGuests",
//            start_at AS "startAt",
//            notes AS "notes"
//          FROM reservations
//          WHERE customer_id = $1`

module.exports = Customer;

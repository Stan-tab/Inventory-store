#! /usr/bin/env node
const { Client } = require("pg");

const sqlString = process.env.connectionString;
if (!sqlString)
	throw new Error(
		"Add connectionString env variable with your database url addres"
	);

const SQL = `
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  itemName VARCHAR ( 255 ) NOT NULL UNIQUE,
  description TEXT,
  release_date DATE
);

CREATE TABLE IF NOT EXISTS devs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  devs_name VARCHAR ( 255 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS genres (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  genreName VARCHAR ( 255 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  groupName VARCHAR ( 255 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS devsToItems (
  devs_id INT REFERENCES devs(id) NOT NULL,
  item_id INT REFERENCES items(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS groupToItems (
  group_id INT REFERENCES groups(id) NOT NULL,
  item_id INT REFERENCES items(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS itemToGenres (
  item_id INT REFERENCES items(id) NOT NULL,
  genre_id INT REFERENCES genres(id) NOT NULL
);

INSERT INTO groups (groupName) VALUES ('games');
INSERT INTO items (itemname, release_date, description) VALUES ('Hotline Miami', '2012-10-23', 'Very funy, interesting and good game mtf');
INSERT INTO devs (devs_name) VALUES ('Dennaton Games');
INSERT INTO genres (genrename) VALUES ('18+'), ('Fun'), ('Hard');

INSERT INTO groupToItems (group_id, item_id) VALUES
  (
    (SELECT id FROM groups WHERE groupName='games'),
    (SELECT id FROM items WHERE itemName='Hotline Miami')
  );

INSERT INTO devsToItems (devs_id, item_id) VALUES
  (
    (SELECT id FROM devs WHERE devs_name='Dennaton Games'),
    (SELECT id FROM items WHERE itemName='Hotline Miami')
  );

INSERT INTO itemToGenres (item_id, genre_id)
  VALUES
    ( 
      (SELECT id FROM items WHERE itemName='Hotline Miami'),
      (SELECT id FROM genres WHERE genreName='18+')
    ),
    ( 
      (SELECT id FROM items WHERE itemName='Hotline Miami'),
      (SELECT id FROM genres WHERE genreName='Fun')
    ),
    ( 
      (SELECT id FROM items WHERE itemName='Hotline Miami'),
      (SELECT id FROM genres WHERE genreName='Hard')
    );
`;

async function main() {
	console.log("seeding...");
	const client = new Client({
		connectionString: sqlString,
	});
	await client.connect();
	await client.query(SQL);
	await client.end();
	console.log("done");
}

main();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`DELETE FROM Activities WHERE name='Menanam Padi di Sawah'`, function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`Row(s) deleted from Activities: ${this.changes}`);
  });
});

db.close();

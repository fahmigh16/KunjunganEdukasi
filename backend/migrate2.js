const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const columnsToAdd = [
    { name: 'paymentStatus', type: 'VARCHAR(255) DEFAULT \'UNPAID\'' },
    { name: 'adminNotes', type: 'TEXT' },
    { name: 'rejectionReason', type: 'TEXT' },
    { name: 'revisionNote', type: 'TEXT' },
  ];

  columnsToAdd.forEach(col => {
    db.run(`ALTER TABLE Bookings ADD COLUMN ${col.name} ${col.type}`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column ${col.name} already exists.`);
        } else {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      } else {
        console.log(`Column ${col.name} added successfully.`);
      }
    });
  });
});

db.close();

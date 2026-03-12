const { MongoClient } = require('mongodb');

async function verifyUser() {
  const url = 'mongodb://127.0.0.1:27017';
  const dbName = 'smart-event-management';
  
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected correctly to server');
    const db = client.db(dbName);
    const collection = db.collection('users');
    
    // Update the user
    const updateResult = await collection.updateOne(
      { email: 'prarthanapk7@gmail.com' },
      { $set: { isVerified: true } }
    );
    
    console.log('Updated documents =>', updateResult);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

verifyUser();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb://aish:aish@cluster0-shard-00-00-ol6u0.mongodb.net:27017,cluster0-shard-00-01-ol6u0.mongodb.net:27017,cluster0-shard-00-02-ol6u0.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

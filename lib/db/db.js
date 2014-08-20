'user strict';


var mongo = require('mongoskin');
process.env.MONGOHQ_URL = process.env.MONGOHQ_URL || "mongodb://huarui:jiang546@kahana.mongohq.com:10032/app28210754";
exports.db = mongo.db(process.env.MONGOHQ_URL)



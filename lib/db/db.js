'user strict';


var mongo = require('mongoskin');
process.env.MONGOHQ_URL = process.env.MONGOHQ_URL || "mongodb://huarui:jiang546@oceanic.mongohq.com:10049/app24361728";
exports.db = mongo.db(process.env.MONGOHQ_URL)



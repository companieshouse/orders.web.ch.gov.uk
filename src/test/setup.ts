import chai from "chai";
import sinonChai from "sinon-chai";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.use(sinonChai);

// global.expect = chai.expect;
// (global as any)['expect'] = chai.expect;

process.env.API_URL = "http://testapi.co";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.CACHE_SERVER = "test";
process.env.CHS_URL = "http://chsurl.co";
process.env.PIWIK_SITE_ID = "test";
process.env.PIWIK_URL = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as sinonChai from "sinon-chai";

chai.use(chaiHttp);
chai.use(sinonChai)

//global.expect = chai.expect;
//(global as any)['expect'] = chai.expect;

process.env.COOKIE_SECRET="Xy6onkjQWF0TkRn0hfdqUw=="
process.env.CACHE_SERVER="test";
process.env.API_URL="api";
process.env.PIWIK_SITE_ID="test";
process.env.PIWIK_URL="test";

/* istanbul ignore next */
import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.use(chaiAsPromised);

// global.expect = chai.expect;
// (global as any)['expect'] = chai.expect;

process.env.API_URL = "http://testapi.co";
process.env.PAYMENTS_API_URL = "https://testpaymentapi.co";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.COOKIE_DOMAIN = "cookiedomain";
process.env.CACHE_SERVER = "test";
process.env.CHS_URL = "http://chsurl.co";
process.env.PIWIK_SITE_ID = "test";
process.env.PIWIK_URL = "test";
process.env.DISPATCH_DAYS = "10";
process.env.DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED = "true";
process.env.DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED = "true";
process.env.RETRY_CHECKOUT_NUMBER= "1";
process.env.RETRY_CHECKOUT_DELAY="100";
process.env.ACCOUNT_URL = "http://account.co";
process.env.CHS_MONITOR_GUI_URL = "http://follow.co";
process.env.BASKET_ITEM_LIMIT = "10";

process.env.CONFIGURABLE_BANNER_ENABLED = 'false';
process.env.CONFIGURABLE_BANNER_TITLE = "This is a banner title for testing";
process.env.CONFIGURABLE_BANNER_TEXT = "This is some banner text for testing.";
process.env.CONFIGURABLE_BANNER_OTHER_TEXT = "This is some other banner text for testing.";

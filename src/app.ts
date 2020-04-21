import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import router from "./routers";
import {PIWIK_SITE_ID, PIWIK_URL, COOKIE_SECRET, CACHE_SERVER} from "./config/config";
import * as cookieParser from "cookie-parser";
import * as Redis from "ioredis";
import {SessionStore, SessionMiddleware} from "ch-node-session-handler";

const app = express();

app.use(cookieParser());

// set some app variables from the environment
app.set("port", process.env.PORT || "3000");
app.set("dev", process.env.NODE_ENV === "development");

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
  viewPath,
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components",
], {
  autoescape: true,
  express: app,
});

const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));
const middleware = SessionMiddleware(
  { cookieName: "__SID", cookieSecret: COOKIE_SECRET},
  sessionStore);

app.use(middleware);

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
if (process.env.NODE_ENV !== "production") {
  app.use("/orders/static", express.static("dist/static"));
  env.addGlobal("CSS_URL", "/orders/static/app.css");
  env.addGlobal("FOOTER", "/orders/static/footer.css");
} else {
  app.use("/orders/static", express.static("static"));
  env.addGlobal("CSS_URL", "/orders/static/app.css");
  env.addGlobal("FOOTER", "/orders/static/footer.css");
}

// apply our default router to /
app.use("/", router);

export default app;

import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "@companieshouse/node-session-handler";
import { createLoggerMiddleware } from "ch-structured-logging";

import authMiddleware from "./middleware/auth.middleware";
import router from "./routers";
import { PIWIK_SITE_ID, PIWIK_URL, COOKIE_SECRET, COOKIE_DOMAIN, CACHE_SERVER, APPLICATION_NAME, CHS_URL } from "./config/config";
import * as pageUrls from "./model/page.urls";
import errorHandlers from "./controllers/error.controller";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    next();
});

// set some app variables from the environment
app.set("port", process.env.PORT || "3000");
app.set("dev", process.env.NODE_ENV === "development");

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
    viewPath,
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/components"
], {
    autoescape: true,
    express: app
});

const cookieConfig: CookieConfig = { cookieName: "__SID", cookieSecret: COOKIE_SECRET, cookieDomain: COOKIE_DOMAIN };
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));

const PROTECTED_PATHS = [pageUrls.BASKET_REMOVE, pageUrls.BASKET, pageUrls.ORDER_ITEM_SUMMARY, pageUrls.ORDER_SUMMARY, pageUrls.ORDERS, pageUrls.DELIVERY_DETAILS];
app.use(PROTECTED_PATHS, createLoggerMiddleware(APPLICATION_NAME));
app.use(PROTECTED_PATHS, SessionMiddleware(cookieConfig, sessionStore));
app.use(PROTECTED_PATHS, authMiddleware);

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
env.addGlobal("CHS_URL", CHS_URL);
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("ACCOUNT_URL", process.env.ACCOUNT_URL);
env.addGlobal("CHS_MONITOR_GUI_URL", process.env.CHS_MONITOR_GUI_URL);

app.use((req, res, next) => {
    env.addGlobal("signedIn", req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1);
    env.addGlobal("userEmail", req.session?.data?.signin_info?.user_profile?.email);
    next();
});

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
if (process.env.NODE_ENV !== "production") {
    app.use("/orders-assets/static", express.static("dist/static"));
    env.addGlobal("CSS_URL", "/orders-assets/static/app.css");
    env.addGlobal("FOOTER", "/orders-assets/static/footer.css");
    env.addGlobal("RESPONSIVE_TABLE", "/orders-assets/static/responsive-table.css");
} else {
    app.use("/orders-assets/static", express.static("static"));
    env.addGlobal("CSS_URL", "/orders-assets/static/app.css");
    env.addGlobal("FOOTER", "/orders-assets/static/footer.css");
    env.addGlobal("RESPONSIVE_TABLE", "/orders-assets/static/responsive-table.css");
}

// apply our default router to /
app.use("/", router);
app.use(...errorHandlers);

export default app;

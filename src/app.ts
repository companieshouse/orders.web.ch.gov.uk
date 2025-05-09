import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import actuator from "express-actuator";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "@companieshouse/node-session-handler";
import { createLoggerMiddleware } from "@companieshouse/structured-logging-node";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";

import authMiddleware from "./middleware/auth.middleware";
import router from "./routers";
import {
    PIWIK_SITE_ID,
    PIWIK_URL,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    APPLICATION_NAME,
    CHS_URL,
    PAYMENTS_API_URL,
    DELIVERY_DETAILS_WEB_URL,
    BASKET_WEB_URL,
    ORDERS_CONFIRMATION_WEB_URL
} from "./config/config";
import * as pageUrls from "./model/page.urls";
import errorHandlers from "./controllers/error.controller";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import { initialiseRedisClient } from "./utils/redis.methods";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const actuatorOptions = {
    basePath: "/orders-web"
};

app.use(actuator(actuatorOptions));

app.use(function (_req, res, next) {
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
    "node_modules/govuk-frontend/components",
    "node_modules/@companieshouse"
], {
    autoescape: true,
    express: app
});

const cookieConfig: CookieConfig = { cookieName: "__SID", cookieSecret: COOKIE_SECRET, cookieDomain: COOKIE_DOMAIN };
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));
initialiseRedisClient(sessionStore);

const PROTECTED_PATHS = [pageUrls.BASKET_REMOVE, pageUrls.BASKET, pageUrls.ORDER_ITEM_SUMMARY, pageUrls.ORDER_SUMMARY, pageUrls.ORDERS, pageUrls.DELIVERY_DETAILS];

app.use(SessionMiddleware(cookieConfig, sessionStore));
const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: "__SID"
  });

app.use(csrfProtectionMiddleware);
app.use(PROTECTED_PATHS, createLoggerMiddleware(APPLICATION_NAME));
app.use(PROTECTED_PATHS, SessionMiddleware(cookieConfig, sessionStore));
app.use(PROTECTED_PATHS, authMiddleware);

app.use((req, res, next) => {
    if (req.path.includes("/delivery-details")) {
        env.addGlobal("FEEDBACK_SOURCE", DELIVERY_DETAILS_WEB_URL);
    } else if (req.path.includes("/basket")) {
        env.addGlobal("FEEDBACK_SOURCE", BASKET_WEB_URL);
    } else if (req.path.includes("/confirmation")) {
        env.addGlobal("FEEDBACK_SOURCE", ORDERS_CONFIRMATION_WEB_URL);
    }
    next();
});

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
env.addGlobal("CHS_URL", CHS_URL);
env.addGlobal("PAYMENT_URL", PAYMENTS_API_URL);
env.addGlobal("DELIVERY_DETAILS_WEB_URL", DELIVERY_DETAILS_WEB_URL);
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("ACCOUNT_URL", process.env.ACCOUNT_URL);
env.addGlobal("CHS_MONITOR_GUI_URL", process.env.CHS_MONITOR_GUI_URL);

app.use("/orders-assets/static", express.static("static"));
env.addGlobal("CSS_URL", "/orders-assets/static/app.css");
env.addGlobal("FOOTER", "/orders-assets/static/footer.css");
env.addGlobal("RESPONSIVE_TABLE", "/orders-assets/static/responsive-table.css");
env.addGlobal("MOBILE_MENU", "/orders-assets/static/js/mobile-menu.js");

// apply our default router to /
app.use("/", router);
app.use(...errorHandlers);

export default app;

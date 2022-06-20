import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";

const logger = createLogger(APPLICATION_NAME);

// extractValueFromRequestField extracts a value that matches the regular expression provided from the request field.
// Extracting a value from a field from the incoming request in this way appears to allay SonarQube's fears that
// any redirect using the value is doing so using user-controlled data.
export const extractValueFromRequestField = (requestField: String, expression: RegExp) => {
    if (requestField) {
        const extractedMatches = requestField.match(expression);
        if (extractedMatches !== null && extractedMatches.length > 0) {
            return extractedMatches[0];
        }
    }
    const error = `Unable to extract value sought from requestField ${requestField} using regular expression ${expression}`;
    logger.error(error);
    throw new Error(error);
};

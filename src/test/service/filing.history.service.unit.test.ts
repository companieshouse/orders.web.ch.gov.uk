import { expect } from "chai";
import sinon from "sinon";
import {
    mapFilingHistoryDescriptionValues, removeAsterisks, mapFilingHistory
} from "../../service/filing.history.service";

describe("filing.history.service.unit", () => {
    describe("mapFilingHistoryDescriptionValues", () => {
        it("should return the description in the descriptionValues if it is present", () => {
            const description = "legacy";
            const descriptionValues = {
                description: "this is the description"
            };
            const result = mapFilingHistoryDescriptionValues(description, descriptionValues);
            expect(result).to.equal(descriptionValues.description);
        });

        it("should replace the values in the description with the values in the descriptionValues", () => {
            const description = "Appointment of {officer_name} as a director on {change_date}";
            const descriptionValues = {
                change_date: "2010-02-12",
                officer_name: "Thomas David Wheare"
            };
            const result = mapFilingHistoryDescriptionValues(description, descriptionValues);
            expect(result).to.equal("Appointment of Thomas David Wheare as a director on 12 February 2010");
        });
    });

    describe("removeAsterisks", () => {
        it("should remove asterisks in text", () => {
            const text = "**Appointment** of ";
            const result = removeAsterisks(text);
            expect(result).to.equal("Appointment of ");
        });
    });

    describe("mapFilingHistory", () => {
        it("should lookup description in api-enumeration, replace the values in the description with the values in the descriptionValues and remove asterisks", () => {
            const description = "appoint-person-director-company-with-name-date";
            const descriptionValues = {
                appointment_date: "2010-02-12",
                officer_name: "Thomas David Wheare"
            };
            const result = mapFilingHistory(description, descriptionValues);
            expect(result).to.equal("Appointment of Thomas David Wheare as a director on 12 February 2010");
        });
    });
});

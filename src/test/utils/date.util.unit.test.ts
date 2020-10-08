import chai from "chai";

import { mapDate, mapFilingHistoryDate } from "../../utils/date.util";

describe("date.util.unit", () => {
    describe("mapDate", () => {
        it("maps am date correctly", () => {
            const result = mapDate("2019-12-16T09:16:17.791Z");
            chai.expect(result).to.equal("16 December 2019 - 09:16:17");
        });

        it("maps pm date correctly", () => {
            const result = mapDate("2019-12-16T13:16:17.791Z");
            chai.expect(result).to.equal("16 December 2019 - 13:16:17");
        });

        it("maps date with minutes and seconds less than 10 correctly", () => {
            const result = mapDate("2019-12-16T13:06:07.791Z");
            chai.expect(result).to.equal("16 December 2019 - 13:06:07");
        });
    });

    describe("mapFilingHistoryDate", () => {
        it("maps short month date correctly", () => {
            const result = mapFilingHistoryDate("2009-12-23");
            chai.expect(result).to.equal("23 Dec 2009");
        });
    });
});

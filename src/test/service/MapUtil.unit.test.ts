import {MapUtil} from "../../service/MapUtil";
import {expect} from "chai";

describe("determineItemOptionsSelectedText", () => {
    it("item option defined returns Yes", () => {
        const result = MapUtil.determineItemOptionsSelectedText(true);
        expect(result).to.equal("Yes");
    });

    it("item option undefined returns No", () => {
        const result = MapUtil.determineItemOptionsSelectedText(undefined);
        expect(result).to.equal("No");
    });

    it('should correctly map to HTML', function () {
        // Given
        const elements = ["This is a test of inserting line breaks", "This is a new line1", "This is a new line2"];

        // When
        const result = MapUtil.mapToHtml(elements);

        // Then
        expect(result).to.equal("This is a test of inserting line breaks<br>This is a new line1<br>This is a new line2<br>")
    });

    it('should correctly escape some HTML special characters', function () {
        // Given
        const elements = ["This is a test for escaping special characters e.g. & and < and >"];

        // When
        const result = MapUtil.mapToHtml(elements);

        // Then
        expect(result).to.equal("This is a test for escaping special characters e.g. &amp; and &lt; and &gt;<br>")
    });
});


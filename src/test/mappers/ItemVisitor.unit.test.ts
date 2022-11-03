import { expect } from "chai";
import { ItemVisitor } from "../../mappers/ItemVisitor";

describe("ItemVisitor", () => {
    describe("makeCellResponsive", () => {
        it("it omits heading element if heading is null", () => {
            // given
            const heading = null;
            const field = "field";

            // when
            const html = ItemVisitor.makeCellResponsive(heading, field);

            // then
            expect(html).to.not.contain("responsive-table__heading");
        });

        it("it contains an empty field element if field is null", () => {
            // given
            const heading = "heading";
            const field = null;

            // when
            const html = ItemVisitor.makeCellResponsive(heading, field);

            // then
            expect(html).to.contain(`<span class="responsive-table__cell" aria-hidden="false"></span>`);
        });

        it("it contains an empty field element if field is undefined", () => {
            // given
            const heading = "heading";
            const field = undefined;

            // when
            const html = ItemVisitor.makeCellResponsive(heading, field);

            // then
            expect(html).to.contain(`<span class="responsive-table__cell" aria-hidden="false"></span>`);
        });

        it("it wraps field in responsive-table__cell span element", () => {
            // given
            const heading = null;
            const field = "field";

            // when
            const html = ItemVisitor.makeCellResponsive(heading, field);
            console.log(html);

            // then
            expect(html).to.contain(`<span class="responsive-table__cell" aria-hidden="false">field</span>`);
        });

        it("it wraps heading in responsive-table__heading span element", () => {
            // given
            const heading = "heading";
            const field = null;

            // when
            const html = ItemVisitor.makeCellResponsive(heading, field);

            // then
            expect(html).to.contain(`<span class="responsive-table__heading" aria-hidden="false">heading</span>`);
        });
    });
});

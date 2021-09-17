const escape = require("escape-html");

export abstract class MapUtil {
    static mapToHtml = (elements: string[]): string => {
        let htmlString: string = "";

        elements.forEach((element) => {
            htmlString += escape(element) + "<br>";
        });
        return htmlString;
    }

    static determineItemOptionsSelectedText = (itemOption: any): string => {
        return (itemOption === undefined) ? "No" : "Yes";
    }

    static addCurrency = (filingHistoryCost: string) => {
        return `£${filingHistoryCost}`;
    };
}
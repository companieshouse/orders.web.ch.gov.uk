const escape = require("escape-html");

export abstract class MapUtil {
    static mapToHtml = (mappings: string[]): string => {
        let htmlString: string = "";

        mappings.forEach((element) => {
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
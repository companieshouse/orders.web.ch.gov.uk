import { mapDateFullMonth } from "../utils/date.util";
import { getFullFilingHistoryDescription } from "../config/api.enumerations";

export const mapFilingHistoryDescriptionValues = (description: string, descriptionValues: Record<string, string>) => {
    if (descriptionValues.description) {
        return descriptionValues.description;
    } else {
        return Object.entries(descriptionValues).reduce((newObj, [key, val]) => {
            const value = key.includes("date") ? mapDateFullMonth(val) : val;
            return newObj.replace("{" + key + "}", value as string);
        }, description);
    }
};

export const removeAsterisks = (description: string) => {
    return description.replace(/\*/g, "");
};

export const mapFilingHistory = (description: string, descriptionValues: Record<string, string>): string => {
    const descriptionFromFile = getFullFilingHistoryDescription(description);
    const mappedFilingHistoryDescription = mapFilingHistoryDescriptionValues(descriptionFromFile, descriptionValues || {});
    const cleanedFilingHistoryDescription = removeAsterisks(mappedFilingHistoryDescription);
    return cleanedFilingHistoryDescription;
};

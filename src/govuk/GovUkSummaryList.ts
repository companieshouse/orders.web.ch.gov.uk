export class GovUkSummaryList {
    entries: GovUkSummaryListEntry[] = [];
}

export class GovUkSummaryListEntry {
    key: GovUkSummaryListObject;
    value: GovUkSummaryListObject;
}

export class GovUkSummaryListObject {
    classes: string;
    text?: string;
    html?: string;
}

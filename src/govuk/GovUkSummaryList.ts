export class GovUkSummaryList {
    entries: GovUkSummaryListEntry[] = [];
}

export class GovUkSummaryListEntry {
    key: GovSummaryListObject;
    value: GovSummaryListObject;
}

export class GovSummaryListObject {
    classes: string;
    text?: string;
    html?: string;
}

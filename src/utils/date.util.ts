
export const mapDate = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    const hour = new Intl.DateTimeFormat("en", { hour: "2-digit", hour12: false }).format(d);
    const minute = new Intl.DateTimeFormat("en", { minute: "2-digit" }).format(d);
    const second = new Intl.DateTimeFormat("en", { second: "numeric" }).format(d);

    const cleanedMinute = mapTimeLessThan10(minute);
    const cleanedSecond = mapTimeLessThan10(second);

    return `${day} ${month} ${year} - ${hour}:${cleanedMinute}:${cleanedSecond}`;
};

const mapTimeLessThan10 = (time: string): string => {
    const timeInt = parseInt(time, 10);
    if (timeInt < 10) {
        return "0" + time;
    }
    return time;
};

export const mapDateFullMonth = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};

export const mapFilingHistoryDate = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};

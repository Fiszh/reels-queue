declare global {
    interface queue_link {
        link: string;
        by: string;
        id: number | string;
    }

    interface userSettings {
        bitsBoots: boolean;
        bitsAmount: number;
    }
}

export { }
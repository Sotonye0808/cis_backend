export const prismaConfig = {
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
};

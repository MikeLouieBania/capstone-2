const{ PrismaClient } = require("@prisma/client");

const database = new PrismaClient ();

async function main() {
    try {
        await database.category.createMany({
            data: [
                { name: "Beginner" },
                { name: "Amatuer" },
                { name: "Professional" },
            ]
        });

      console.log("success");  
    } catch (error) {
        console.log("Error seeding the databse categories", error);
    } finally {
        await database.$disconnect();
    }
}

main();
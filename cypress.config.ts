import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

export default defineConfig({
  e2e: {
      baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      on("task", {
          "db:seed": async () => {
              dotenv.config({ path: "./hh-backend/.env.test" });
              const { seedDatabase } = await import("./hh-backend/src/tests/seedDatabase");

              return await seedDatabase();
          },
          "db:teardown": async () => {
              dotenv.config({ path: "./hh-backend/.env.test" });
              const { teardownDatabase } = await import("./hh-backend/src/tests/seedDatabase");

              return await teardownDatabase();
          }
      })
        return config;
    },
  },

});

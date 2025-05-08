import request from 'supertest';
import app from "../app";
import prisma from "../utility/prisma";

describe('House Routes', () => {
  // let app: Express;

  beforeAll(async () => {
      await prisma.employee.deleteMany();
      await request(app)
          .post("/api/auth/register")
          .send({
              employeeId: "test123",
              name: "John Doe",
              email: "director@test.com",
              password: "StrongPass123",
              confirmPassword: "StrongPass123",
              position: "DIRECTOR",
              hireDate: "2024-03-09",
          });
      await request(app)
          .post("/api/auth/register")
          .send({
              employeeId: "test456",
              name: "John Doe",
              email: "john@test.com",
              password: "StrongPass123",
              confirmPassword: "StrongPass123",
              hireDate: "2024-03-09",
          });
  });
  afterAll(async () => {
      await prisma.employee.deleteMany();
  })
  beforeEach(() => {
    //app = express();
    // app.use(bodyParser.json());
    // app.use(cookieParser());
    // app.use('/houses', router);
  });
  describe("add house", () => {
      beforeEach(async () => {
          await prisma.house.deleteMany();
      })
      const validHouse = { houseId: "H1234", name: "Testtopia", street1: "123 Test Loop", city: "Seattle", state: "WA", maxClients: 2, femaleEmployeeOnly: false};
        it("should successfully add the house for a director", async () => {
            const login = {email: "director@test.com", password: "StrongPass123"};
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send(login);
            const token = loginResponse.body.accessToken;
            const response = await request(app).post("/api/house")
                .set("Authorization", `Bearer ${token}`)
                .send(validHouse);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("house");
            expect(response.body.message).toBe("House successfully added");
        });
        it("should return a 401 if no token provided", async () => {
            const response = await request(app).post("/api/house")
                .send(validHouse);
            expect(response.statusCode).toBe(401);
        });
        it("should return 403 for ASSOCIATE (or MANAGER)", async () => {
            const login = {email: "john@test.com", password: "StrongPass123"};
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send(login);
            const token = loginResponse.body.accessToken;
            const response = await request(app).post("/api/house")
                .set("Authorization", `Bearer ${token}`)
                .send(validHouse);
            expect(response.statusCode).toBe(403);
        });

      const requiredFields = ["houseId", "name", "street1", "city", "state", "maxClients", "femaleEmployeeOnly"];

      requiredFields.forEach((field) => {
          it(`should return 400 when '${field}' is missing`, async () => {
              const invalidData = {...validHouse};
              delete invalidData[field as keyof typeof validHouse];  // Remove the field

              const login = {email: "director@test.com", password: "StrongPass123"};
              const loginResponse = await request(app)
                  .post("/api/auth/login")
                  .send(login);
              const token = loginResponse.body.accessToken;
              const response = await request(app).post("/api/house")
                  .set("Authorization", `Bearer ${token}`)
                  .send(invalidData);
              expect(response.status).toBe(400);
              expect(response.body).toHaveProperty("message");
              expect(response.body.message).toBe("invalid data");
              expect(response.body.errors).toHaveProperty(field);
          });
      });
      it("should return 400 for duplicate house id", async () => {
          const login = {email: "director@test.com", password: "StrongPass123"};
          const loginResponse = await request(app)
              .post("/api/auth/login")
              .send(login);
          const token = loginResponse.body.accessToken;
          const response = await request(app).post("/api/house")
              .set("Authorization", `Bearer ${token}`)
              .send(validHouse);
          const secondHouse = { ...validHouse, name: "New name"};
          const badResponse = await request(app).post("/api/house")
              .set("Authorization", `Bearer ${token}`)
              .send(secondHouse);
          expect(badResponse.statusCode).toBe(400);
          expect(badResponse.body.message).toBe("invalid data");
          expect(badResponse.body.errors).toHaveProperty("houseId");
      });
      it("should return 400 for duplicate house name", async () => {
          const login = {email: "director@test.com", password: "StrongPass123"};
          const loginResponse = await request(app)
              .post("/api/auth/login")
              .send(login);
          const token = loginResponse.body.accessToken;
          const response = await request(app).post("/api/house")
              .set("Authorization", `Bearer ${token}`)
              .send(validHouse);
          const secondHouse = { ...validHouse, houseId: "N1234"};
          const badResponse = await request(app).post("/api/house")
              .set("Authorization", `Bearer ${token}`)
              .send(secondHouse);
          expect(badResponse.statusCode).toBe(400);
          expect(badResponse.body.message).toBe("invalid data");
          expect(badResponse.body.errors).toHaveProperty("name");
      });

  });

    describe("get all houses", () => {
        const endpoint = "/api/house";

        beforeEach(async () => {
            await prisma.house.deleteMany();
            await prisma.employee.deleteMany();

            // Create a director
            await request(app).post("/api/auth/register").send({
                employeeId: "dir001",
                name: "Director",
                email: "director@test.com",
                password: "StrongPass123",
                confirmPassword: "StrongPass123",
                position: "DIRECTOR",
                hireDate: "2024-03-09",
            });

            // Create a house
            await prisma.house.create({
                data: {
                    houseId: "H1234",
                    name: "Alpha House",
                    street1: "100 Main St",
                    city: "Townsville",
                    state: "TS",
                    maxClients: 3,
                    femaleEmployeeOnly: false,
                },
            });
        });

        it("should return all houses for an authenticated user", async () => {
            const loginRes = await request(app).post("/api/auth/login").send({
                email: "director@test.com",
                password: "StrongPass123",
            });

            const token = loginRes.body.accessToken;

            const res = await request(app)
                .get(endpoint)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "houses successfully retrieved");
            expect(Array.isArray(res.body.houses)).toBe(true);
            expect(res.body.houses.length).toBeGreaterThan(0);
            expect(res.body.houses[0]).toHaveProperty("houseId", "H1234");
        });

        it("should return 401 if no token is provided", async () => {
            const res = await request(app).get(endpoint);
            expect(res.status).toBe(401);
        });

        // Optional: simulate a server error
        it("should handle internal server errors", async () => {
            const loginRes = await request(app).post("/api/auth/login").send({
                email: "director@test.com",
                password: "StrongPass123",
            });

            const token = loginRes.body.accessToken;

            jest.spyOn(require("../services/house.service"), "getHouses")
                .mockRejectedValue(new Error("Database connection failed"));

            // Temporarily override getHouses to throw
            // const originalGetHouses = jest.requireActual("../services/house.service").getHouses;
            // jest.mock("../services/house.service", () => ({
            //     getHouses: jest.fn().mockRejectedValue(new Error("DB failure")),
            // }));

            const res = await request(app)
                .get(endpoint)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(500); // If your error middleware sets 500
        });
    });

});
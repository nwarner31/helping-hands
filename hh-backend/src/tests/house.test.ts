import request from 'supertest';
import app from "../app";
import prisma from "../utility/prisma";

describe('House Routes', () => {
  // let app: Express;

  beforeAll(async () => {
      await prisma.house.deleteMany();
      await prisma.client.deleteMany();
      await prisma.employee.deleteMany();
      const adminRegister = await request(app)
          .post("/api/auth/register")
          .send({
              employeeId: "test123",
              name: "John Doe",
              email: "admin@test.com",
              password: "StrongPass123",
              confirmPassword: "StrongPass123",
              position: "ADMIN",
              hireDate: "2024-03-09",
          });
      await request(app)
          .post("/api/auth/register")
          .send({
              employeeId: "test456",
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
              employeeId: "test789",
              name: "John Doe",
              email: "john@test.com",
              password: "StrongPass123",
              confirmPassword: "StrongPass123",
              hireDate: "2024-03-09",
          });
  });
  afterAll(async () => {
      await prisma.house.deleteMany();
      await prisma.client.deleteMany();
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

        beforeAll(async () => {
            await prisma.house.deleteMany();

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
                password: "StrongPass123"
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


            const res = await request(app)
                .get(endpoint)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(500); // If your error middleware sets 500
        });
    });

    describe("update house", () => {
        const updatedHouse = {
            houseId: "H1234",
            name: "Updated Name",
            street1: "456 New Street",
            city: "Tacoma",
            state: "WA",
            maxClients: 3,
            femaleEmployeeOnly: true,
        };

        beforeEach(async () => {
            await prisma.house.deleteMany();
            await prisma.house.create({
                data: {
                    houseId: "H1234",
                    name: "Original Name",
                    street1: "123 Test Loop",
                    city: "Seattle",
                    state: "WA",
                    maxClients: 2,
                    femaleEmployeeOnly: false,
                }
            });
        });

        it("should successfully update the house for a director", async () => {
            const login = { email: "director@test.com", password: "StrongPass123" };
            const loginResponse = await request(app).post("/api/auth/login").send(login);
            const token = loginResponse.body.accessToken;

            const response = await request(app)
                .put("/api/house/H1234")
                .set("Authorization", `Bearer ${token}`)
                .send(updatedHouse);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("House successfully updated");
            expect(response.body.house.name).toBe("Updated Name");
            expect(response.body.house.city).toBe("Tacoma");
        });

        it("should return 401 if no token provided", async () => {
            const response = await request(app).put("/api/house/H1234").send(updatedHouse);
            expect(response.status).toBe(401);
        });

        it("should return 403 for associate-level user", async () => {
            const login = { email: "john@test.com", password: "StrongPass123" };
            const loginResponse = await request(app).post("/api/auth/login").send(login);
            const token = loginResponse.body.accessToken;

            const response = await request(app)
                .put("/api/house/H1234")
                .set("Authorization", `Bearer ${token}`)
                .send(updatedHouse);

            expect(response.status).toBe(403);
        });

        const requiredFields = [
            "houseId",
            "name",
            "street1",
            "city",
            "state",
            "maxClients",
            "femaleEmployeeOnly",
        ];

        requiredFields.forEach((field) => {
            it(`should return 400 when '${field}' is missing`, async () => {
                const validHouse = {
                    houseId: "H1234",
                    name: "Updated Name",
                    street1: "456 New Street",
                    city: "Tacoma",
                    state: "WA",
                    maxClients: 3,
                    femaleEmployeeOnly: true,
                };

                const invalidData = { ...validHouse };
                delete invalidData[field as keyof typeof validHouse];

                const login = { email: "director@test.com", password: "StrongPass123" };
                const loginResponse = await request(app)
                    .post("/api/auth/login")
                    .send(login);
                const token = loginResponse.body.accessToken;

                const response = await request(app)
                    .put(`/api/house/${validHouse.houseId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("message", "invalid data");
                expect(response.body.errors).toHaveProperty(field);
            });
        });


        it("should return 400 if house does not exist", async () => {
            const login = { email: "director@test.com", password: "StrongPass123" };
            const loginResponse = await request(app).post("/api/auth/login").send(login);
            const token = loginResponse.body.accessToken;

            const response = await request(app)
                .put("/api/house/NON_EXISTENT")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...updatedHouse, houseId: "NON_EXISTENT" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("invalid data");
            expect(response.body.errors).toHaveProperty("houseId");
        });
    });

    describe('add client to house', () => {
        let token: string;
        const house = {
            houseId: "H1001",
            name: "Harmony Home",
            street1: "1 Peaceful Way",
            city: "Calmville",
            state: "WA",
            maxClients: 2,
            femaleEmployeeOnly: false,
        };
        const client = {
            clientId: "T12345",
            legalName: "Test Client",
            dateOfBirth: "2000-04-12",
            sex: "M"
        };
        beforeEach(async () => {
            const admin = await request(app).post("/api/auth/login")
                .send({email: "admin@test.com",
                    password: "StrongPass123"});
            await request(app).post("/api/client")
                .set("Authorization", `Bearer ${admin.body.accessToken}`)
                .send(client);
            token = admin.body.accessToken;

            await request(app).post("/api/house")
                .set("Authorization", `Bearer ${admin.body.accessToken}`)
                .send(house);
        });
        afterEach(async () => {
           prisma.house.deleteMany();
           prisma.client.deleteMany();
        });
        afterAll(async () => {
            await prisma.house.deleteMany();
            await prisma.client.deleteMany();
            await prisma.employee.deleteMany();
        });

        it("should successfully add a client to a house", async () => {
            const res = await request(app)
                .patch(`/api/house/${house.houseId}/clients`)
                .set("Authorization", `Bearer ${token}`)
                .send({ clientId: client.clientId });

            expect(res.status).toBe(209);
            expect(res.body.message).toBe("client added to house");
            expect(res.body.house).toHaveProperty("houseId", house.houseId);
        });
        it("should return 400 if house ID is invalid", async () => {
            const res = await request(app)
                .patch("/api/house/INVALID_ID/clients")
                .set("Authorization", `Bearer ${token}`)
                .send({ clientId: client.clientId });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("invalid data");
            expect(res.body.errors).toHaveProperty("houseId");
        });
        it("should return 400 if client ID is invalid", async () => {
            const res = await request(app)
                .patch(`/api/house/${house.houseId}/clients`)
                .set("Authorization", `Bearer ${token}`)
                .send({ clientId: "NON_EXISTENT_CLIENT" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("invalid data");
            expect(res.body.errors).toHaveProperty("clientId");
        });
        it("should return 401 if not authenticated", async () => {
            const res = await request(app)
                .patch("/api/house/H1001/clients")
                .send({ clientId: "C2001" });

            expect(res.status).toBe(401);
        });
        it("should return 403 for a MANAGER", async () => {
            const associate = await request(app).post("/api/auth/login").send({email: "john@test.com",
                password: "StrongPass123"});

            const res = await request(app)
                .patch(`/api/house/${house.houseId}/clients`)
                .set("Authorization", `Bearer ${associate.body.accessToken}`)
                .send({ clientId: client.clientId });

            expect(res.status).toBe(403);
        })
    });
});
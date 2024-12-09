const supertest = require('supertest');
const server = require('./server.js');

describe("post /auth", () => {
    describe("when the request is valid", () => {
        test("should respond with acessToken", async () => {
            const response = await supertest(server).post("/auth").send({ username: "username", password: "password" });
            expect(response.body).toHaveProperty('accessToken');
        })
    }, 20000)
})
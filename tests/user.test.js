import request from "supertest";
import { app } from "../app.js";

describe("GET /api/v1/user/get-user", () => {
    it("should get the user info", async () => {
        return request(app)
            .get("/api/v1/user/get-user")
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.statusCode).toBe(200);
            })
    })
})
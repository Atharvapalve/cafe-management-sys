import request from "supertest"
import app from "../index.js"
import User from "../models/User.js"
import mongoose from "mongoose"

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe("Authentication", () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty("token")
    expect(res.body.user).toHaveProperty("name", "Test User")
  })

  it("should login an existing user", async () => {
    await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    })

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty("token")
    expect(res.body.user).toHaveProperty("name", "Test User")
  })
})


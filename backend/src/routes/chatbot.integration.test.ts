import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../database", () => ({
  default: {
    prepare: vi.fn(() => ({
      all: vi.fn(() => [])
    }))
  }
}));

import chatbotRoutes from "./chatbot";

const app = express();
app.use(express.json());
app.use("/api", chatbotRoutes);

describe("Chatbot integration tests", () => {
  it("rejects an empty question", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "" });

    expect(response.status).toBe(400);
  });

  it("rejects questions over 1000 characters", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "a".repeat(1001) });

    expect(response.status).toBe(400);
  });

  it("declines betting advice", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "Who should I bet on?" });

    expect(response.status).toBe(200);
    expect(response.body.answer).toContain("can't provide betting advice");
  });

  it("declines fantasy start/sit advice", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "Who should I start?" });

    expect(response.status).toBe(200);
    expect(response.body.answer).toContain("fantasy start/sit decisions");
  });

  it("handles questions without a recognized team or player", async () => {
    const response = await request(app)
      .post("/api/chatbot")
      .send({ message: "Tell me about the NFL" });

    expect(response.status).toBe(200);
    expect(response.body.answer).toContain("couldn't identify");
  });
});

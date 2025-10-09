import { RequestHandler } from "express";
import type { Request, Response } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo = (_req: Request, res: Response) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};

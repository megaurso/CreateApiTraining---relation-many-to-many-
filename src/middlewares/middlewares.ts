import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import client from "../database/config";
import { DevelopResult } from "../interfaces/interfaces";

const ensureDeveloperExist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = +req.params.id;

  const queryString: string = `
          SELECT 
              *
          FROM
            developers
          WHERE
              id = $1 ;
      `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DevelopResult = await client.query(queryConfig);

  if (!queryResult.rowCount) {
    return res.status(404).json({
      message: "Developer not found",
    });
  }

  return next();
};

export { ensureDeveloperExist };

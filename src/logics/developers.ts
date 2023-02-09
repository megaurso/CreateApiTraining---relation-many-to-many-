import { Request, Response } from "express";
import format from "pg-format";
import {
  DevelopInfoidResult,
  DevelopInfoResult,
  DevelopResult,
  IDevelop,
  IDevelopInfo,
  IDevelopInfoResult,
  IDevelopRequest,
} from "../interfaces/interfaces";
import client from "../database/config";
import { QueryConfig } from "pg";

const validateList = (payload: IDevelopRequest): IDevelopRequest => {
  const keys: Array<string> = Object.keys(payload);
  const requiredKeys = ["name", "email"];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!containsAllRequired) {
    throw new Error(`Required keys: ${requiredKeys}`);
  }

  return payload;
};

const validateListInfo = (payload: IDevelopInfoResult): IDevelopInfoResult => {
  const keys: Array<string> = Object.keys(payload);
  const requiredKeys = ["developerSince", "preferredOS"];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!containsAllRequired) {
    throw new Error(`Missing required keys: ${requiredKeys}`);
  }

  return payload;
};

const createDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dataRequest: IDevelopRequest = validateList(req.body);

    const queryExists: string = `
        SELECT 
            *
        FROM 
            developers 
        WHERE email = $1
    `;
    const queryConfig: QueryConfig = {
      text: queryExists,
      values: [dataRequest.email],
    };

    const queryReallyExist = await client.query(queryConfig);

    if (queryReallyExist.rows.length) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    const queryString: string = format(
      `
                INSERT INTO
                    developers(%I)
                VALUES
                    (%L)
                RETURNING *;
            `,
      Object.keys(dataRequest),
      Object.values(dataRequest)
    );
    const queryResult: DevelopResult = await client.query(queryString);
    const newResult: IDevelop = queryResult.rows[0];
    return res.status(201).json(newResult);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createInfoDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dataInfo: IDevelopInfoResult = validateListInfo(req.body);
    const id: number = +req.params.id;

    const queryString = format(
      `
        INSERT INTO 
        developer_infos(%I)
        VALUES(%L)
        RETURNING *
        `,
      Object.keys(dataInfo),
      Object.values(dataInfo)
    );

    const queryResults: DevelopInfoidResult = await client.query(queryString);
    const queryRelation = `
              UPDATE
                  developers SET "developerInfoId" = $1
              WHERE id = $2;
        `;
    const queryConfig: QueryConfig = {
      text: queryRelation,
      values: [queryResults.rows[0].id, id],
    };

    await client.query(queryConfig);
    console.log(queryResults.rows[0]);
    return res.status(201).json(queryResults.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const listAllDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString: string = `
        SELECT
            de.*,
            di."developerSince",
            di."preferredOS"
        FROM 
            developers de
        LEFT JOIN developer_infos di ON de."developerInfoId" = di.id; 
`;
  const queryResult: DevelopInfoResult = await client.query(queryString);

  return res.json(queryResult.rows);
};

const listOneDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = +req.params.id;
  const queryString: string = `
        SELECT
            de.*,
            di."developerSince",
            di."preferredOS"
        FROM 
            developers de
        LEFT JOIN developer_infos di ON de."developerInfoId" = di.id
        WHERE 
		    de.id = $1; 
`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DevelopInfoResult = await client.query(queryConfig);

  return res.json(queryResult.rows[0]);
};

const updateDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id: number = +req.params.id;
    const updateKeys = Object.keys(req.body);
    const updateData = Object.values(req.body);

    const formatString: string = format(
      `
      UPDATE
        developers
      SET(%I) = ROW(%L) 
      WHERE
        id = $1
        RETURNING *;
    `,
      updateKeys,
      updateData
    );
    const queryConfig: QueryConfig = {
      text: formatString,
      values: [id],
    };

    const queryExists: string = `
    SELECT 
        *
    FROM 
        developers 
    WHERE email = $1
`;
    const queryIfExist: QueryConfig = {
      text: queryExists,
      values: [req.body.email],
    };

    const queryReallyExist = await client.query(queryIfExist);

    if (queryReallyExist.rows.length) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    const queryResult = await client.query(queryConfig);
    return res.json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "At least one of those keys must be send.",
        keys: [ "name", "email" ],
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateInfoDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id: number = +req.params.id;
    const updateKeys = Object.keys(req.body);
    const updateData = Object.values(req.body);

    const formatString: string = format(
      `
      UPDATE
        developer_infos
      SET(%I) = ROW(%L) 
      WHERE
        id = $1
        RETURNING *;
    `,
      updateKeys,
      updateData
    );
    const queryConfig: QueryConfig = {
      text: formatString,
      values: [id],
    };

    const queryResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
      return res.status(404).json({
        message: "Developer not found",
      });
    }

    return res.json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "At least one of those keys must be send.",
       keys: [ "developerSince", "preferredOS" ]
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = +req.params.id;

  const queryString: string = `
    DELETE FROM 
      developers
    WHERE 
      id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id]
  }
  await client.query(queryConfig)
  return res.status(204).send()
};

export {
  createDeveloper,
  listAllDevelopers,
  listOneDevelopers,
  createInfoDevelopers,
  updateDevelopers,
  updateInfoDevelopers,
  deleteDevelopers
};

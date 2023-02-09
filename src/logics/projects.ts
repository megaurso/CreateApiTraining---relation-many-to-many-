import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import client from "../database/config";
import {
  DevelopResult,
  IProjects,
  ProjectsResults,
} from "../interfaces/interfaces";

const validateProject = (payload: IProjects): IProjects => {
  const keys: Array<string> = Object.keys(payload);
  const requiredKeys = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];

  const constainsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!constainsAllRequired) {
    throw new Error(`Required keys: ${requiredKeys}`);
  }

  return payload;
};

const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dataRequest: IProjects = validateProject(req.body);

    const id: number = req.body.developerId;

    const queryExists: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1 ;
    `;

    const queryConfig: QueryConfig = {
      text: queryExists,
      values: [id],
    };

    const queryResultExist: DevelopResult = await client.query(queryConfig);

    if (!queryResultExist.rowCount) {
      return res.status(404).json({
        message: "Developer not found",
      });
    }

    const queryString: string = format(
      `
            INSERT INTO 
                projects(%I)
            VALUES
                (%L)
            RETURNING *;
        `,
      Object.keys(dataRequest),
      Object.values(dataRequest)
    );
    const queryResult: ProjectsResults = await client.query(queryString);
    const newResult: IProjects = queryResult.rows[0];
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

const listAllProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT 
        po.id AS "projectID",
        po."name" AS "projectName",
        po."description" AS "projectDescription",
        po."estimatedTime" AS "projectEstimatedTime",
        po."repository" AS "projectRepository",
        po."startDate" AS "projectStartDate",
        po."endDate" AS "projectEndDate",
        po."developerId" AS "projectDeveloperID",
        te.id AS "technologyID",
        te."name" AS "technologyName"
    FROM 
        projects po 
    LEFT JOIN 
        projects_technologies pt ON pt."projectId" = po.id 
    LEFT JOIN 
        technologies te ON te.id = pt."technologyId" ;
`;
  const queryResult = await client.query(queryString);

  return res.json(queryResult.rows);
};

const listOneProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = +req.params.id;
  const queryString: string = `
    SELECT 
        po.id AS "projectID",
        po."name" AS "projectName",
        po."description" AS "projectDescription",
        po."estimatedTime" AS "projectEstimatedTime",
        po."repository" AS "projectRepository",
        po."startDate" AS "projectStartDate",
        po."endDate" AS "projectEndDate",
        po."developerId" AS "projectDeveloperID",
        te.id AS "technologyID",
        te."name" AS "technologyName"
    FROM 
        projects po 
    LEFT JOIN 
        projects_technologies pt ON pt."projectId" = po.id 
    LEFT JOIN 
        technologies te ON te.id = pt."technologyId"
    WHERE
        po.id = $1 ;
`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: ProjectsResults = await client.query(queryConfig);

  return res.json(queryResult.rows);
};

const updateProjects = async (
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
              projects
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
        message: `At least one of those keys must be send.`,
        key: [
          "name",
          "description",
          "estimatedTime",
          "repository",
          "startDate",
          "endDate",
          "developerId",
        ],
      });
    }
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = +req.params.id;

  const queryString: string = `
    DELETE FROM 
        projects
    WHERE
        id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);
  return res.status(204).send();
};

export { createProject, listAllProjects, listOneProject, updateProjects,deleteProject };

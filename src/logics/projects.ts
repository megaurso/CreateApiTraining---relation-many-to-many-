import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import client from "../database/config";
import {
  DevelopResult,
  IChangeTecnologic,
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

const createTecologicToProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id: number = +req.params.id;
    const dataRequest: IChangeTecnologic = req.body;
    const queryFindString: string = `
        SELECT 
          *
        FROM
          technologies te
        WHERE 
          te."name" = $1;
    `;
    const queryConfigIfExist: QueryConfig = {
      text: queryFindString,
      values: [dataRequest.name],
    };
    const queryResultIfExist = await client.query(queryConfigIfExist);

    const idTecno: string = queryResultIfExist.rows[0].id;

    const queryString = `
      INSERT INTO
        projects_technologies("technologyId","projectId")
      VALUES($1,$2)
      RETURNING *
      `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [idTecno, id],
    };

    await client.query(queryConfig);

    const queryStringResult: string = `
        SELECT 
          te.id AS "technologyId",
          te."name" AS "technologyName",
          pr.id AS "projectId",
          pr."name" AS "projectName",
          pr.description AS "projectDescription",
          pr."estimatedTime" AS "projectEstimatedTime",
          pr.repository AS "projectRepository",
          pr."startDate" AS "projectStartDate",
          pr."endDate" AS "projectEndDate"
      FROM 
        technologies te
      JOIN 
        projects_technologies pt ON pt."technologyId" = te.id 
      JOIN 
        projects pr ON pr.id = pt."projectId" 
      WHERE 
        pr.id = $1;
    `;

    const queryConfigResult: QueryConfig = {
      text: queryStringResult,
      values: [id],
    };
    const queryResult = await client.query(queryConfigResult);

    return res.json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: "Technology not supported.",
        keys: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
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
      return res.status(404).json({
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

const deleteTecnologicProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = +req.params.id;
  const name: string = req.params.name;
  const keys = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  const nameExist = keys.find((elem) => elem === name);
  if (nameExist === undefined) {
    return res.status(404).json({
      message: "Technology not supported",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const queryStringId: string = `
    SELECT
      *
    FROM
      projects
    WHERE
      id = $1;
  `;
  const queryConfigId: QueryConfig = {
    text: queryStringId,
    values: [id],
  };
  const queryResultsId = await client.query(queryConfigId);

  const queryStringName: string = `
  SELECT 
    *
  FROM
    technologies te
  WHERE 
    te."name" = $1;
  `;
  const queryConfigName: QueryConfig = {
    text: queryStringName,
    values: [name],
  };
  const queryResultsName = await client.query(queryConfigName);
  const idProject = queryResultsId.rows[0];
  const nameProject = queryResultsName.rows[0];

  const queryVerifyName: string = `
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
	  te."name" = $1;
  `;

  const queryConfigIfNameExist: QueryConfig = {
    text: queryVerifyName,
    values: [req.params.name],
  };

  const nameExists = await client.query(queryConfigIfNameExist);
  const nameReallyExist = nameExists.rows.find((elem)=> {
    if(elem.projectID === req.params.id){
    return  elem.technologyName === req.params.name
    }
  })
''
  if (nameReallyExist === undefined) {
    return res.status(404).json({
      message: `Technology ${req.params.name} not found on this Project.`,
    });
  }

  const queryString: string = `
    DELETE FROM
      projects_technologies
    WHERE 
      "projectId" = $1 and "technologyId" = $2
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [+idProject.id, nameProject.id],
  };
  await client.query(queryConfig);

  return res.status(204).send();
};

export {
  createProject,
  listAllProjects,
  listOneProject,
  updateProjects,
  deleteProject,
  createTecologicToProject,
  deleteTecnologicProject,
};

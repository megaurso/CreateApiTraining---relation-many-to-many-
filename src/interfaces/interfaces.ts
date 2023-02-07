import { QueryResult } from "pg"

interface IDevelopRequest  {
    name: string,
    email: string
}

interface IDevelop extends IDevelopRequest {
    id: number,
    developerInfoId: number
}

interface IDevelopInfo extends IDevelop {
    developerSince: Date,
    preferredOS:string
}

interface IDevelopInfoResult {
    developerSince: Date,
    preferredOS:string
}

interface IDevelopIdMoreInfo extends IDevelopInfoResult{
    id: number
}

type DevelopResult = QueryResult<IDevelop>
type DevelopInfoResult= QueryResult<IDevelopInfo>
type DevelopInfoidResult = QueryResult<IDevelopIdMoreInfo>

export {
    IDevelopRequest,
    IDevelop,
    IDevelopInfo,
    IDevelopInfoResult,
    DevelopResult,
    DevelopInfoResult,
    DevelopInfoidResult
}
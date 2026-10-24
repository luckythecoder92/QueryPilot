/** Hand-written from the live FastAPI OpenAPI document (2026-10-25). */
export type Status = 'VERIFIED' | 'INSUFFICIENT DATA' | 'NEEDS CLARIFICATION' | 'QUERY FAILED'
export interface Profile { rows:number; columns:number; missing:number; dtypes:Record<string,string> }
export interface Dataset { id:string; name:string; table:string; sqlite_path?:string; columns:string[]; profile:Profile }
<<<<<<< HEAD
export interface Health { ok:boolean; provider?:string; available?:boolean; ollama:boolean; active_model:string|null; mode:'online'|'offline'; online:boolean; voice_available:boolean }
export interface Dashboard { kpis:Record<string,number>; figures:string[]; table:Record<string,unknown>[]; columns:string[] }
export interface Answer { status:Status; answer:string; proof:Record<string,unknown>; sql:string|null; table?:Record<string,unknown>[]; chart?:unknown; model_used?:string|null; mode?:string|null }
export interface TableResponse { columns:string[]; rows:Record<string,unknown>[]; total:number; page:number; page_size:number; pages:number }
=======
export interface Health { ok:boolean; ollama:boolean; active_model:string|null; mode:'online'|'offline'; online:boolean; voice_available:boolean }
export interface Dashboard { kpis:Record<string,number>; figures:string[]; table:Record<string,unknown>[]; columns:string[] }
export interface Answer { status:Status; answer:string; proof:Record<string,unknown>; sql:string|null; table?:Record<string,unknown>[]; chart?:unknown; model_used?:string|null; mode?:string|null }
export interface TableResponse { columns:string[]; rows:Record<string,unknown>[] }
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
export interface History { dataset_id:string; question:string; status:Status; model_used?:string|null }

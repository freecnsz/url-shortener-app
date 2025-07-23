import { Request } from "express";

export interface RawRequestDto {
  method: string;
  url: string;
  originalUrl: string;
  protocol: string;
  headers: Record<string, string | string[] | undefined>;
  ip: string;
  ips: string[];
  hostname: string;
  path: string;
  query: Record<string, any>;
  params: Record<string, any>;
  body: any;
  cookies?: Record<string, any>;
}

export function buildRawRequestDto(req: Request): RawRequestDto {
  return {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    protocol: req.protocol,
    headers: req.headers,
    ip: req.ip || req.socket.remoteAddress || "unknown",
    ips: req.ips || [],
    hostname: req.hostname,
    path: req.path,
    query: req.query,
    params: req.params,
    body: req.body,
    cookies: req.cookies,
  };
}

import { ClickLog } from "../../entities/ClickLog";
import { Url } from "../../entities/Url";

export interface IUrlRepository {
  findByShortCodeAsync(shortCode: string): Promise<Url | null>;
  findByCustomAliasAsync(customAlias: string): Promise<Url | null>;
  createAsync(url: Url): Promise<Url>;
  updateAsync(url: Url): Promise<Url>;
  deleteAsync(id: string): Promise<void>;
  createClickLogAsync(clickLog: ClickLog): Promise<ClickLog>;
  findClickLogsByUrlId(urlId: string): Promise<ClickLog[]>;
}
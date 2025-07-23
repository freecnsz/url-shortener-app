import { Url } from "../../domain/entities/Url";
import { CreateShortUrlResponseDto } from "../dtos/urls/CreateShortUrlDto";

export class UrlMapper {
  static toShortUrlResponse(url: Url): CreateShortUrlResponseDto {
    return {
      shortUrl: url.shortCode,
      message: "URL shortened successfully",
    };
  }

  static toShortUrlResponseArray(urls: Url[]): CreateShortUrlResponseDto[] {
    return urls.map((url) => this.toShortUrlResponse(url));
  }
}

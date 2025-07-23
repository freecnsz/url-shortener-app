import { Request, Response } from "express";
import {
  CreateShortUrlRequestDto,
  CreateShortUrlResponseDto,
} from "../../application/dtos/urls/CreateShortUrlDto";
import { asyncHandler } from "../middleware/asyncHandler";
import { responseHelper } from "../../utils/responseHelper";
import { container } from "../../di/Container";
import { RedirectRequestDto } from "../../application/dtos/urls/RedirectRequestDto";
import { buildRawRequestDto } from "../../application/dtos/urls/RawRequest";
import { createShortUrlSchema } from "../../infrastructure/validators/CreateShortUrlSchema";
import { ValidationError } from "../../domain/errors";
import { redirectSchema } from "../../infrastructure/validators/RedirectSchema";

export class UrlController {
  private createShortUrlUseCase = container.getCreateShortUrlUseCase();
  private redirectToOriginalUrlUseCase =
    container.getRedirectToOriginalUrlUseCase();

  public createShortUrl = asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate request body
    const validationResult = createShortUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new ValidationError(errorMessage);
    }

    const validatedData = validationResult.data;

    // 2. Create DTO from validated data
    const createShortUrlDto: CreateShortUrlRequestDto = {
      originalUrl: validatedData.originalUrl,
    };

    // 3. Execute use case
    const result = await this.createShortUrlUseCase.execute(createShortUrlDto);
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new ValidationError(
        "Base URL is not defined in environment variables"
      );
    }

    const responseData: CreateShortUrlResponseDto = {
      shortUrl: `${baseUrl}/${result.shortUrl}`,
      message: "Short URL created successfully",
    };

    // 4. Return success response
    return responseHelper.success<CreateShortUrlResponseDto>(res, responseData);
  });

  public redirectToOriginalUrl = asyncHandler(
    async (req: Request, res: Response) => {

      // 1. Validate request parameters
      const validationResult  = redirectSchema.safeParse(req.params);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw new ValidationError(errorMessage);
      }

      // 2. Create DTO from validated data
      const validatedData = validationResult.data;

      // 3. Build raw request DTO
      const rawRequest = buildRawRequestDto(req);

      const redirectRequestDto: RedirectRequestDto = {
        shortCode: validatedData.shortCode,
      };
      
      const originalUrl = await this.redirectToOriginalUrlUseCase.execute(
        redirectRequestDto,
        rawRequest
      );

      return res.redirect(302, originalUrl!);
    }
  );
}

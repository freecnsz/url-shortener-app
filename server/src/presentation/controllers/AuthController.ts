import { Request, Response } from "express";
import { container } from "../../di/Container";
import { CreateUserRequestDto } from "../../application/dtos/auth/CreateUserDto";
import { CreateUserResponseDto } from "../../application/dtos/auth/CreateUserDto"; 
import { createUserSchema } from "../../infrastructure/validators/CreateUserSchema";
import { ValidationError } from "../../domain/errors/ValidationError";
import { responseHelper } from "../../utils/responseHelper";
import { asyncHandler } from "../middleware/asyncHandler";
import { loginSchema } from "../../infrastructure/validators/loginSchema";
import { LoginRequestDto, LoginResponseDto } from "../../application/dtos/auth/LoginDto";
import { UserMapper } from "../../application/mappers/UserMapper";
import { OAuthLoginResponseDto } from "../../application/dtos/auth/OAuthLoginDto";
import { oAuthSchema } from "../../infrastructure/validators/OAuthSchema";

export class AuthController {
  private createUserUseCase = container.getCreateUserUseCase();
  private loginUseCase = container.getLoginUseCase();

  public register = asyncHandler(
    async (req: Request, res: Response) => {
      // 1. Validate request body
      const validationResult = createUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw new ValidationError(errorMessage);
      }

      const validatedData = validationResult.data;

      // 2. Create DTO from validated data
      const createUserDto: CreateUserRequestDto = {
        email: validatedData.email,
        password: validatedData.password,
        username: validatedData.username || undefined,
        firstName: validatedData.firstName || undefined,
        lastName: validatedData.lastName || undefined,
      };

      // 3. Execute use case
      const result = await this.createUserUseCase.execute(createUserDto);

      // 4. Map to response DTO
      const responseData = UserMapper.toCreateUserResponse(result);

      // 5. Return success response
      return responseHelper.success<CreateUserResponseDto>(
        res,
        responseData,
        "User created successfully"
      );
    }
  );

  public login = asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate request body
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new ValidationError(errorMessage);
    }

    const validatedData = validationResult.data;

    // 2. Create DTO from validated data
    const loginDto: LoginRequestDto = {
      email: validatedData.email,
      password: validatedData.password,
    };

    // 3. Execute use case
    const result = await this.loginUseCase.execute(loginDto);

    // 4. Return success response
    return responseHelper.success<LoginResponseDto>(
      res,
      result,
      "Login successful"
    );
  });

  public googleOAuthLoginOrRegister = asyncHandler(
    async (req: Request, res: Response) => {
      // 1. Validate request body
      const validationResult = oAuthSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw new ValidationError(errorMessage);
      }

      // 2. Create DTO from validated data
      const oAuthDto = { accessToken: validationResult.data.accessToken };

      // 3. Execute use case
      const result = await container.getOAuthGoogleRegisterOrLoginUseCase().execute(oAuthDto);

      // 4. Return success response
      return responseHelper.success<OAuthLoginResponseDto>(
        res,
        result,
        "Google OAuth login or register successful"
      );
    }
  );

}
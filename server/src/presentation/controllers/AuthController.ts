import { Request, Response } from "express";
import { container } from "../../di/Container";
import { CreateUserRequestDto, CreateUserRequest } from "../../application/dtos/auth/CreateUserDto";
import { CreateUserResponseDto } from "../../application/dtos/auth/CreateUserDto";
import { createUserSchema } from "../../infrastructure/validators/CreateUserSchema";
import { ValidationError } from "../../domain/errors/ValidationError";
import { responseHelper } from "../../utils/responseHelper";
import { asyncHandler } from "../middleware/asyncHandler";
import { loginSchema } from "../../infrastructure/validators/loginSchema";
import { LoginRequestDto, LoginResponseDto } from "../../application/dtos/auth/LoginDto";
import { LoginUseCase } from "../../application/usecases/auth/LoginUseCase";

export class AuthController {
  private createUserUseCase = container.getCreateUserUseCase();
  private loginUseCase = container.getLoginUseCase();

  public register = asyncHandler(
    async (req: CreateUserRequest, res: Response) => {
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
        username: validatedData.username,
        fullName: validatedData.fullName ? validatedData.fullName : undefined,
      };

      // 3. Execute use case
      const result = await this.createUserUseCase.execute(createUserDto);

      // 4. Return success response with proper status code
      const responseData = CreateUserResponseDto.fromUser(result);
      return responseHelper.created<CreateUserResponseDto>(
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

    // 4. Return success response with proper status code
    return responseHelper.success<LoginResponseDto>(
      res,
      result,
      "Login successful"
    );
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement logout logic
    responseHelper.error(res, "Logout not implemented yet", 501);
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement refresh token logic
    responseHelper.error(res, "Refresh token not implemented yet", 501);
  });
}

import { JobHandler } from "../QueueManager";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { container } from "../../../di/Container";

interface ProcessUserLoginJobData {
  userId: string;
  lastLoginAt?: Date;
  updatedAt?: Date;
}

export class ProcessUserLoginJobHandler implements JobHandler {
  private readonly userRepository: IUserRepository;

  constructor() {
    this.userRepository = container.getUserRepository();
  }

  public async handle(data: ProcessUserLoginJobData): Promise<void> {
    if (!data.userId) {
      console.warn("No userId provided to ProcessUserLoginJobHandler");
      return;
    }

    try {
      const now = new Date();

      const dbUser = await this.userRepository.findByIdAsync(data.userId);
      if (!dbUser) {
        console.warn(`User with ID ${data.userId} not found in database`);
        return;
      }

      dbUser.lastLoginAt = data.lastLoginAt || now;
      dbUser.updatedAt = data.updatedAt || now;

      await this.userRepository.updateAsync(dbUser);

      console.log(
        `Last login updated for user ${data.userId} at ${now.toISOString()}`
      );
    } catch (error) {
      console.error(
        `Failed to process user login for user ${data.userId}:`,
        error
      );
    }
  }
}

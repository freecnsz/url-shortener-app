export class User {
    constructor(
    public readonly id: string,
    public username: string,
    public email: string,
    public passwordHash: string,
    public provider: string = 'local',
    public fullName?: string,
    public bio?: string,
    public profilePictureUrl?: string,
    public isEmailVerified: boolean = false,
    public createdAt: Date = new Date()
    ) {}
}
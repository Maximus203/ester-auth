export interface User {
 id: number;
 firstName: string;
 lastName: string;
 email: string;
 password: string;
 createdAt: Date;
 updatedAt: Date;
}

export interface CreateUserData {
 firstName: string;
 lastName: string;
 email: string;
 password: string;
}

export interface UpdateUserData {
 firstName?: string;
 lastName?: string;
 email?: string;
 password?: string;
}

export interface UserWithoutPassword {
 id: number;
 firstName: string;
 lastName: string;
 email: string;
 createdAt: Date;
 updatedAt: Date;
}

export interface LoginCredentials {
 email: string;
 password: string;
}

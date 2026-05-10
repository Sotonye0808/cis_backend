export class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;

    constructor(statusCode: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid request payload', details?: unknown) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

export class UserNotFoundError extends AppError {
    constructor(message = 'User not found') {
        super(404, 'USER_NOT_FOUND', message);
    }
}

export class EmailAlreadyExistsError extends AppError {
    constructor(message = 'A user with this email already exists') {
        super(409, 'EMAIL_ALREADY_EXISTS', message);
    }
}

export class RoleNotFoundError extends AppError {
    constructor(message = 'Role not found') {
        super(404, 'ROLE_NOT_FOUND', message);
    }
}

export class InvalidRoleScopeError extends AppError {
    constructor(message = 'Invalid role scope') {
        super(400, 'INVALID_ROLE_SCOPE', message);
    }
}

export class OrgGroupNotFoundError extends AppError {
    constructor(message = 'Org group not found') {
        super(404, 'ORG_GROUP_NOT_FOUND', message);
    }
}

export class CampusNotFoundError extends AppError {
    constructor(message = 'Campus not found') {
        super(404, 'CAMPUS_NOT_FOUND', message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(403, 'FORBIDDEN', message);
    }
}

export class InvalidTokenError extends AppError {
    constructor(message = 'Invalid token') {
        super(401, 'INVALID_TOKEN', message);
    }
}

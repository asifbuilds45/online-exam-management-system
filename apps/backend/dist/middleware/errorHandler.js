"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    console.error('[API Error]', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
        });
    }
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const mockDb_js_1 = require("../services/mockDb.js");
const supabase_js_1 = require("../config/supabase.js");
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token missing' });
        }
        const token = authHeader.split(' ')[1];
        // 1. Check if token is a local mock token
        if (token.startsWith('mock-token-')) {
            const email = token.replace('mock-token-', '');
            const profile = mockDb_js_1.mockDb.profiles.find((p) => p.email === email);
            if (!profile) {
                return res.status(401).json({ error: 'User profile not found' });
            }
            req.user = profile;
            return next();
        }
        // 2. Try verifying standard JWT token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.config.jwtSecret);
            const profile = mockDb_js_1.mockDb.profiles.find((p) => p.id === decoded.sub || p.email === decoded.email);
            if (profile) {
                req.user = profile;
                return next();
            }
        }
        catch (e) {
            // JWT verification failed, check Supabase auth if configured
        }
        // 3. Check Supabase Auth if configured
        if (supabase_js_1.supabaseAdmin) {
            const { data, error } = await supabase_js_1.supabaseAdmin.auth.getUser(token);
            if (!error && data.user) {
                // Fetch profile
                const { data: profile } = await supabase_js_1.supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                if (profile) {
                    req.user = profile;
                    return next();
                }
            }
        }
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
    catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User context missing' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Forbidden: Requires one of [${roles.join(', ')}] roles. Yours is '${req.user.role}'`
            });
        }
        next();
    };
}

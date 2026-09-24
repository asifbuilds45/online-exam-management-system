"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const env_js_1 = require("../config/env.js");
const mockDb_js_1 = require("../services/mockDb.js");
const supabase_js_1 = require("../config/supabase.js");
const resend_js_1 = require("../config/resend.js");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.enum(['student', 'faculty', 'admin']).optional()
});
async function login(req, res) {
    const { email, password, role } = loginSchema.parse(req.body);
    // 1. Try Supabase Auth if configured
    if (supabase_js_1.supabaseAdmin && !email.endsWith('@college.edu')) {
        const { data, error } = await supabase_js_1.supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });
        if (!error && data.session && data.user) {
            const { data: profile } = await supabase_js_1.supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            if (profile) {
                mockDb_js_1.mockDb.logAudit('USER_LOGIN', 'PROFILE', profile.id, { email, provider: 'supabase' }, profile.id, profile.email);
                return res.json({
                    token: data.session.access_token,
                    user: profile
                });
            }
        }
    }
    // 2. Demo / Fallback local authentication
    let profile = mockDb_js_1.mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
        // If demo login with any role specified, create a transient profile
        profile = {
            id: (0, uuid_1.v4)(),
            full_name: email.split('@')[0].toUpperCase(),
            email,
            role: role || 'student',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockDb_js_1.mockDb.profiles.push(profile);
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ sub: profile.id, email: profile.email, role: profile.role }, env_js_1.config.jwtSecret, { expiresIn: '24h' });
    const mockToken = `mock-token-${profile.email}`;
    mockDb_js_1.mockDb.logAudit('USER_LOGIN', 'PROFILE', profile.id, { email, role: profile.role }, profile.id, profile.email);
    return res.json({
        token: env_js_1.config.isSupabaseConfigured ? token : mockToken,
        user: profile
    });
}
async function me(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // Fetch populated department/batch if present
    const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === req.user?.department_id);
    const batch = mockDb_js_1.mockDb.batches.find((b) => b.id === req.user?.batch_id);
    return res.json({
        user: {
            ...req.user,
            department: dept ? dept.name : undefined,
            batch: batch ? batch.name : undefined
        }
    });
}
async function forgotPassword(req, res) {
    const { email } = zod_1.z.object({ email: zod_1.z.string().email() }).parse(req.body);
    const resetToken = (0, uuid_1.v4)();
    const resetUrl = `${env_js_1.config.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await (0, resend_js_1.sendEmail)({
        to: email,
        subject: 'Password Reset Request - Online Exam Management System',
        html: `
      <h2>OEMS Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
        text: `Password reset link: ${resetUrl}`
    });
    mockDb_js_1.mockDb.logAudit('PASSWORD_RESET_REQUEST', 'PROFILE', undefined, { email });
    return res.json({
        message: 'Password reset email sent successfully.',
        resetUrlDemo: resetUrl
    });
}
async function resetPassword(req, res) {
    const { email, newPassword } = zod_1.z
        .object({
        email: zod_1.z.string().email(),
        newPassword: zod_1.z.string().min(6)
    })
        .parse(req.body);
    mockDb_js_1.mockDb.logAudit('PASSWORD_RESET_COMPLETE', 'PROFILE', undefined, { email });
    return res.json({ message: 'Password reset completed successfully. You can now login.' });
}

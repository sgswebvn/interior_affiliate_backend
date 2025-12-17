"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../config/jwt");
async function login(email, password) {
    const admin = await prisma_1.prisma.admin.findUnique({ where: { email } });
    if (!admin)
        throw new Error('Invalid credentials');
    const ok = await bcrypt_1.default.compare(password, admin.password);
    if (!ok)
        throw new Error('Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email }, jwt_1.jwtSecret, { expiresIn: jwt_1.jwtExpiresIn });
    return token;
}

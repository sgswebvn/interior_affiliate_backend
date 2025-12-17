"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpiresIn = exports.jwtSecret = void 0;
const env_1 = require("./env");
exports.jwtSecret = env_1.JWT_SECRET;
exports.jwtExpiresIn = '7d';

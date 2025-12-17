"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_1 = require("./middlewares/rateLimit");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// CORS (configure via env CORS_ORIGIN)
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
// Body size limit
app.use(express_1.default.json({ limit: process.env.BODY_LIMIT || '2mb' }));
// Rate limiter applied to API routes
app.use('/api', rateLimit_1.apiLimiter);
app.use('/api', routes_1.default);
// Error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;

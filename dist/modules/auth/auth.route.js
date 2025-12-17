"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), auth_controller_1.login);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_public_route_1 = __importDefault(require("./modules/post/post.public.route"));
const topic_public_route_1 = __importDefault(require("./modules/topic/topic.public.route"));
const affiliate_public_route_1 = __importDefault(require("./modules/affiliate/affiliate.public.route"));
const admin_route_1 = __importDefault(require("./modules/admin/admin.route"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Auth
// Public SEO API
router.use('/posts', post_public_route_1.default);
router.use('/topics', topic_public_route_1.default);
router.use('/redirect', affiliate_public_route_1.default);
// Admin CMS API
router.use('/admin', auth_middleware_1.authenticate, admin_route_1.default);
exports.default = router;

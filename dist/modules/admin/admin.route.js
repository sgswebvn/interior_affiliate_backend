"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_admin_route_1 = __importDefault(require("../post/post.admin.route"));
const topic_admin_route_1 = __importDefault(require("../topic/topic.admin.route"));
const tag_admin_route_1 = __importDefault(require("../tag/tag.admin.route"));
const affiliate_admin_route_1 = __importDefault(require("../affiliate/affiliate.admin.route"));
const router = (0, express_1.Router)();
router.use('/posts', post_admin_route_1.default);
router.use('/topics', topic_admin_route_1.default);
router.use('/tags', tag_admin_route_1.default);
router.use('/affiliates', affiliate_admin_route_1.default);
exports.default = router;

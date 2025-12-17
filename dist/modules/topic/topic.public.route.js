"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const topic_controller_1 = require("./topic.controller");
const router = (0, express_1.Router)();
router.get('/', topic_controller_1.listTopics);
exports.default = router;

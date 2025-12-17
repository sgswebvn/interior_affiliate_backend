"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const topic_controller_1 = require("./topic.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const topic_schema_1 = require("./topic.schema");
const router = (0, express_1.Router)();
router.post('/', (0, validate_middleware_1.validate)(topic_schema_1.createTopicSchema), topic_controller_1.createTopic);
exports.default = router;

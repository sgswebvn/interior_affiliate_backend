"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const affiliate_controller_1 = require("./affiliate.controller");
const router = (0, express_1.Router)();
router.get('/:affiliateId', affiliate_controller_1.redirectAffiliate);
exports.default = router;

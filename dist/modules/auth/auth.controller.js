"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
exports.loginController = loginController;
const auth_service_1 = require("./auth.service");
Object.defineProperty(exports, "login", { enumerable: true, get: function () { return auth_service_1.login; } });
async function loginController(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }
    const token = await (0, auth_service_1.login)(email, password);
    res.json({ token });
}

const User = require("../models/user.model");
class AdminController {
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await User.countDocuments();

            return res.json({
                success: true,
                message: "Users retrieved successfully",
                data: {
                    users,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async getUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }

            return res.json({
                success: true,
                message: "User retrieved successfully",
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async createUser(req, res) {
        try {
            const { email, password, firstName, lastName, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                    data: null
                });
            }

            const user = await User.create({
                email,
                password,
                firstName,
                lastName,
                role
            });

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async updateUser(req, res) {
        try {
            const { firstName, lastName, role, status } = req.body;

            const user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    firstName,
                    lastName,
                    role,
                    status
                },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }

            return res.json({
                success: true,
                message: "User updated successfully",
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }

            return res.json({
                success: true,
                message: "User deleted successfully",
                data: null
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }
}

module.exports = new AdminController();
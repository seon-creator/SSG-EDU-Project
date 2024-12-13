const User = require('../models/user.model');
const Report = require('../models/report.model');
const mongoose = require('mongoose');
const moment = require('moment'); // Thêm dòng này
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
    async getBasicStats(req, res) {
        try {
            // 1. Thống kê chi tiết người dùng theo role
            const userStats = {
                total: await User.countDocuments(),
                users: await User.countDocuments({ role: 'user' }),
                doctors: await User.countDocuments({ role: 'doctor' }),
                admins: await User.countDocuments({ role: 'admin' })
            };
            console.log("User statistics:", userStats);

            // 2. Thống kê báo cáo tai nạn
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            // Tổng số reports và phân loại
            const reportStats = {
                total: await Report.countDocuments(),
                severe: await Report.countDocuments({ isSevere: true }),
                nonSevere: await Report.countDocuments({ isSevere: false })
            };

            // Query các reports theo thời gian và mức độ nghiêm trọng
            const dailyStats = {
                total: await Report.countDocuments({
                    isCreated: {
                        $gte: todayStart,
                        $lte: new Date()
                    }
                }),
                severe: await Report.countDocuments({
                    isCreated: {
                        $gte: todayStart,
                        $lte: new Date()
                    },
                    isSevere: true
                }),
                nonSevere: await Report.countDocuments({
                    isCreated: {
                        $gte: todayStart,
                        $lte: new Date()
                    },
                    isSevere: false
                })
            };

            const weeklyStats = {
                total: await Report.countDocuments({
                    isCreated: {
                        $gte: weekStart,
                        $lte: new Date()
                    }
                }),
                severe: await Report.countDocuments({
                    isCreated: {
                        $gte: weekStart,
                        $lte: new Date()
                    },
                    isSevere: true
                }),
                nonSevere: await Report.countDocuments({
                    isCreated: {
                        $gte: weekStart,
                        $lte: new Date()
                    },
                    isSevere: false
                })
            };

            const monthlyStats = {
                total: await Report.countDocuments({
                    isCreated: {
                        $gte: monthStart,
                        $lte: new Date()
                    }
                }),
                severe: await Report.countDocuments({
                    isCreated: {
                        $gte: monthStart,
                        $lte: new Date()
                    },
                    isSevere: true
                }),
                nonSevere: await Report.countDocuments({
                    isCreated: {
                        $gte: monthStart,
                        $lte: new Date()
                    },
                    isSevere: false
                })
            };

            // 3. Số phiên chat đang hoạt động
            const chatCollection = mongoose.connection.db.collection('chat_sessions');
            const activeChats = await chatCollection.countDocuments({
                end_time: null
            });

            return res.status(200).json({
                success: true,
                data: {
                    users: {
                        total: userStats.total,
                        byRole: {
                            users: userStats.users,
                            doctors: userStats.doctors,
                            admins: userStats.admins
                        }
                    },
                    reports: {
                        overall: {
                            total: reportStats.total,
                            severe: reportStats.severe,
                            nonSevere: reportStats.nonSevere
                        },
                        daily: {
                            total: dailyStats.total,
                            severe: dailyStats.severe,
                            nonSevere: dailyStats.nonSevere
                        },
                        weekly: {
                            total: weeklyStats.total,
                            severe: weeklyStats.severe,
                            nonSevere: weeklyStats.nonSevere
                        },
                        monthly: {
                            total: monthlyStats.total,
                            severe: monthlyStats.severe,
                            nonSevere: monthlyStats.nonSevere
                        }
                    },
                    activeChats: activeChats
                },
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error in getBasicStats:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}


module.exports = new AdminController();
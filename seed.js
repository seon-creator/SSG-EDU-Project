const connectDB = require('./src/config/database'); // Sử dụng kết nối từ database.js
const User = require('./src/models/user.model'); // Đường dẫn tới model User
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker'); // Import Faker.js
// Dữ liệu mẫu
const generateFakeUsers = (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const gender = faker.helpers.arrayElement(['male', 'female']);
        users.push({
            email: faker.internet.email(),
            password: 'password123', // Mật khẩu mẫu (sẽ được hash tự động nhờ middleware)
            userId: `U${faker.number.int({ min: 1000, max: 9999 })}`,
            firstName: faker.name.firstName(gender),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
            gender: gender,
            height: faker.number.int({ min: 150, max: 200 }), // Sử dụng faker.number.int() thay cho faker.datatype.number()
            weight: faker.number.int({ min: 45, max: 120 }), // Sử dụng faker.number.int() thay cho faker.datatype.number()
            bloodGroup: faker.helpers.arrayElement(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']),
            healthHistory: faker.lorem.sentence(),
            role: faker.helpers.arrayElement(['user', 'doctor', 'admin']),
            verified: 'true',
        });
    }
    return users;
};

// Hàm seed dữ liệu vào cơ sở dữ liệu
const seedDatabase = async () => {
    try {
        // Kết nối tới cơ sở dữ liệu
        await connectDB();
        console.log('Database connected');

        // Xóa dữ liệu cũ
        await User.deleteMany();
        console.log('Old users removed');

        // Tạo và chèn dữ liệu giả
        const fakeUsers = generateFakeUsers(50); // Tạo 50 người dùng giả
        await User.insertMany(fakeUsers);
        console.log('Fake users added');

        // Ngắt kết nối
        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1); // Thoát với mã lỗi
    }
};

// Gọi hàm seed
seedDatabase();
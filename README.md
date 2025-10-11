# 🏗️ Precast Crane Management System

## 🚀 Overview
**ระบบจัดการเครนอัจฉริยะสำหรับงานคอนกรีตสำเร็จรูป** - โซลูชันครบวงจรที่ช่วยให้วิศวกร ผู้จัดการ และผู้ดูแลระบบสามารถประสานงานการใช้เครน ติดตามความคืบหน้าของงาน และจัดการการจองได้อย่างมีประสิทธิภาพสูงสุด

ด้วยเทคโนโลยีที่ทันสมัยและอินเทอร์เฟซที่ใช้งานง่าย ระบบนี้จะช่วย **ลดเวลาการรอคอย** 🚀 **เพิ่มประสิทธิภาพการทำงาน** ⚡ และ **ลดข้อผิดพลาด** ✅ ได้อย่างมีนัยสำคัญ

## ✨ คุณสมบัติเด่น

### 🏗️ ฟังก์ชันหลัก
- **🗂️ จัดการคิวเครนแบบเรียลไทม์**: ติดตามและจัดการคิวงานเครน พร้อมอัปเดตสถานะทันที
- **📅 ระบบจองอัจฉริยะ**: จองเครนล่วงหน้าแบบมีระบบอนุมัติที่ชาญฉลาด
- **📊 ติดตามความคืบหน้า**: ตรวจสอบเวลาเริ่ม/หยุดงานและสถานะการทำงานแบบละเอียด
- **📈 วิเคราะห์ข้อมูล**: ดูข้อมูลประวัติการทำงานและตัวชี้วัดประสิทธิภาพ
- **👥 จัดการสิทธิ์ผู้ใช้**: ควบคุมการเข้าถึงตามบทบาทหน้าที่

### 🎯 ผู้ใช้แต่ละประเภท
- **👷‍♂️ วิศวกร**: สร้างการจอง ดูสถานะเครน ดำเนินการพื้นฐาน
- **👨‍💼 ผู้จัดการ**: อนุมัติ/ปฏิเสธการจอง จัดการปฏิบัติการเครน
- **⚙️ ผู้ดูแลระบบ**: เข้าถึงระบบเต็มรูปแบบ จัดการผู้ใช้ กำหนดค่าระบบ

## Tech Stack

### Backend (precast-api)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (with better-sqlite3)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schema validation

### Frontend (precast-ui)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Language**: Thai interface

## Getting Started

### Prerequisites
- Node.js (v20.x or higher)
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
# Install backend dependencies
cd precast-api
npm install

# Install frontend dependencies
cd ../precast-ui
npm install
```

2. **Start the backend:**
```bash
cd precast-api
npm run dev
```
The API server will start on http://localhost:4000

3. **Start the frontend:**
```bash
cd precast-ui
npm run dev
```
The React app will start on http://localhost:5173 (or 5174 if 5173 is occupied)

## Usage

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (full access)

### Basic Workflow

1. **Login** to the system using the default credentials
2. **View Dashboard** to see crane status and overview
3. **Create Bookings** for crane usage:
   - Select desired crane (TC1, TC2)
   - Fill in item details, requester info, purpose
   - Set start and end times
   - Submit for approval (if not admin/manager)
4. **Manage Crane Operations**:
   - Start/stop tasks using the queue management
   - Track work progress in real-time
   - Rollback tasks if needed
5. **Monitor & Report**:
   - View historical data
   - Export data to CSV
   - Analyze performance metrics

### Navigation

- **หน้าหลัก (Home)**: Main dashboard with crane status
- **ภาพรวม (Overview)**: Charts and analytics
- **จองคิว (Booking)**: Create and manage bookings
- **ประวัติ (History)**: Historical data and exports
- **จัดการเครน (Crane Management)**: Add new cranes
- **ตัวเลือก (Optional)**: Settings and user role management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Cranes
- `GET /api/cranes` - Get all cranes with queue
- `POST /api/cranes` - Create new crane
- `POST /api/cranes/:id/start/:ord` - Start task
- `POST /api/cranes/:id/stop/:ord` - Stop task
- `POST /api/cranes/:id/rollback/:ord` - Rollback task

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status

### History
- `GET /api/history` - Get work history

## Database Schema

### Tables
- **cranes**: Crane information
- **queue**: Current work queue for each crane
- **bookings**: Crane booking requests
- **history**: Completed work records
- **users**: User accounts and roles

## Development

### Project Structure
```
/
├── precast-api/          # Backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── db.ts         # Database configuration
│   │   └── index.ts      # Main server file
│   └── package.json
└── precast-ui/           # Frontend React app
    ├── src/
    │   ├── components/   # React components
    │   ├── api.ts        # API client
    │   └── App.tsx       # Main app component
    └── package.json
```

### Key Files
- **precast-api/src/db.ts**: Database initialization and connection
- **precast-api/src/routes/auth.ts**: Authentication logic
- **precast-ui/src/App.tsx**: Main React application
- **precast-ui/src/api.ts**: Frontend API client

## Troubleshooting

### Common Issues

1. **"Failed to fetch cranes" error**
   - Ensure backend server is running on port 4000
   - Check that database is properly initialized

2. **Login issues**
   - Use default credentials: admin/admin123
   - Check browser console for detailed errors

3. **Booking creation fails**
   - Verify all required fields are filled
   - Check network tab for API error details

### Logs Location
- Backend logs: Terminal where `npm run dev` is running
- Frontend logs: Browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational/demonstration purposes.

## Support

For issues or questions, please check:
1. Application logs in browser console
2. Server logs in terminal
3. Network tab for API communication issues

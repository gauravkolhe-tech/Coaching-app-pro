


import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';

// --- TYPE DEFINITIONS --- //
// Fix: Added type definitions to resolve multiple TypeScript errors related to untyped data.
type User = {
    id: string;
    username: string;
    password: string;
    role: "admin" | "teacher" | "student";
    name: string;
};

type Notice = {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    pinned: boolean;
};

type Attendance = {
    [studentId: string]: {
        [date: string]: 'present' | 'absent';
    }
};

type Submission = {
    status: string;
    file: string;
    submissionDate: string;
};

type Assignment = {
    id: number;
    title: string;
    subject: string;
    dueDate: string;
    submissions: { [studentId: string]: Submission };
};

type Video = {
    id: number;
    subject: string;
    title: string;
    url: string;
};

type Fee = {
    total: number;
    paid: number;
    pending: number;
};

interface CardProps {
    title: React.ReactNode;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
}


// --- MOCK DATA --- //
const initialUsers: { [key: string]: User } = {
    "admin1": { id: "admin1", username: "gaurav", password: "gauravB0916w", role: "admin", name: "Gaurav" },
    "teacher1": { id: "teacher1", username: "teacher", password: "password", role: "teacher", name: "Dr. Evelyn Reed" },
    "student1": { id: "student1", username: "student", password: "password", role: "student", name: "Alex Johnson" },
    "student2": { id: "student2", username: "student2", password: "password", role: "student", name: "Maria Garcia" },
};

const initialNotices: Notice[] = [
    { id: 1, title: "Mid-Term Exams Schedule", content: "The mid-term exams will be held from 15th to 20th of next month. Please prepare well.", author: "Dr. Evelyn Reed", date: "2023-10-26", pinned: true },
    { id: 2, title: "Holiday Announcement", content: "The center will be closed for the national holiday on the 1st of next month.", author: "Gaurav", date: "2023-10-25", pinned: false },
];

const createInitialAttendance = (): Attendance => {
    const attendance: Attendance = { student1: {}, student2: {} };
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (d > date) break; 
        if (d.getDay() === 0) continue; // Skip Sundays
        const dateString = d.toISOString().slice(0, 10);
        attendance.student1[dateString] = Math.random() > 0.1 ? 'present' : 'absent'; 
        attendance.student2[dateString] = Math.random() > 0.25 ? 'present' : 'absent';
    }
    return attendance;
}

const initialAssignments: Assignment[] = [
    { id: 1, title: "Physics: Chapter 5 Problems", subject: "Physics", dueDate: "2023-11-05", submissions: { "student1": { status: "Submitted", file: "alex_physics.pdf", submissionDate: "2023-11-04" } } },
    { id: 2, title: "Math Quiz: Algebra", subject: "Math", dueDate: "2023-11-02", submissions: {} },
];

const initialVideos: Video[] = [
    { id: 1, subject: "Physics", title: "Introduction to Thermodynamics", url: "https://www.youtube.com/embed/1_p5tW-I_e8" },
    { id: 2, subject: "Math", title: "Calculus Basics: Derivatives", url: "https://www.youtube.com/embed/9vKqVkMQff4" },
];

const initialFees: { [key: string]: Fee } = {
    "student1": { total: 5000, paid: 5000, pending: 0 },
    "student2": { total: 5000, paid: 3000, pending: 2000 },
};

// --- ICONS --- //
const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.69c.125.14.242.285.35.435" /></svg>,
    fees: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-15c-.621 0-1.125-.504-1.125-1.125V8.25m18-3.75v3.75m-18 0h18M12 15.75h.008v.008H12v-.008z" /></svg>,
    notice: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
    attendance: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    assignment: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    video: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1zM4.929 4.929a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414L4.929 4.929zM3 12a1 1 0 0 0-1-1H1a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1zm1.929 7.071a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414zM12 21a1 1 0 0 0 1-1v-2a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1zm7.071-1.929a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414zM21 12a1 1 0 0 0-1-1h-1a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1zm-1.929-7.071a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 1 0 1.414-1.414l-1.414-1.414zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75zM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zM18.894 6.106a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 1 1-1.06-1.061l1.591-1.591a.75.75 0 0 1 1.06 0zM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75zM17.834 17.834a.75.75 0 0 1-1.06 0l-1.591-1.591a.75.75 0 1 1 1.06-1.06l1.591 1.592a.75.75 0 0 1 0 1.06zM12 21.75a.75.75 0 0 1-.75-.75v-2.25a.75.75 0 0 1 1.5 0V21a.75.75 0 0 1-.75-.75zM5.106 18.894a.75.75 0 0 1 0-1.06l1.592-1.591a.75.75 0 1 1 1.06 1.06l-1.591 1.592a.75.75 0 0 1-1.06 0zM2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75zM6.166 6.166a.75.75 0 0 1 1.06 0l1.591 1.591a.75.75 0 1 1-1.06 1.06L6.166 7.227a.75.75 0 0 1 0-1.06z"/></svg>,
    pin: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M16.5 3.75a.75.75 0 01.75.75v10.19l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 111.06-1.06l2.47 2.47V4.5a.75.75 0 01.75-.75zM8.25 4.5a.75.75 0 01.75.75v10.19l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 111.06-1.06l2.47 2.47V5.25a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>,
};


// --- CONTEXT & PROVIDER --- //
const DataContext = createContext(null!);

const useData = () => {
    return useContext(DataContext);
};

// Fix: Added explicit type for children prop to resolve error.
const DataProvider = ({ children }: { children: React.ReactNode }) => {
    // Fix: Typed state variables to ensure type safety and fix property access errors.
    const [users, setUsers] = useState<{ [key: string]: User }>(initialUsers);
    const [notices, setNotices] = useState<Notice[]>(initialNotices);
    const [attendance, setAttendance] = useState<Attendance>(createInitialAttendance());
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const [fees, setFees] = useState<{ [key: string]: Fee }>(initialFees);

    // Fix: Type inference for students and teachers is now correct due to typed 'users' state.
    const students = useMemo(() => Object.values(users).filter(u => u.role === 'student'), [users]);
    const teachers = useMemo(() => Object.values(users).filter(u => u.role === 'teacher'), [users]);

    const showNotification = (message: string) => {
        // In a real app, this would trigger a more robust notification system
        alert(`🔔 Notification: ${message}`);
    };

    const addNotice = (notice: Omit<Notice, 'id' | 'date' | 'pinned'>) => {
        const newNotice = { ...notice, id: Date.now(), date: new Date().toISOString().slice(0, 10), pinned: false };
        setNotices(prev => [newNotice, ...prev]);
        showNotification(`New notice posted: "${notice.title}"`);
    };

    const togglePinNotice = (id: number) => {
        setNotices(notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };
    
    const deleteNotice = (id: number) => {
        setNotices(notices.filter(n => n.id !== id));
    };
    
    const markAttendance = (studentId: string, date: string, status: 'present' | 'absent') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [date]: status
            }
        }));
    };

    const addAssignment = (assignment: Omit<Assignment, 'id' | 'submissions'>) => {
        const newAssignment = { ...assignment, id: Date.now(), submissions: {} };
        setAssignments(prev => [newAssignment, ...prev]);
        showNotification(`New assignment posted: "${assignment.title}"`);
    };

    const submitAssignment = (assignmentId: number, studentId: string, file: string) => {
        setAssignments(prev => prev.map(a => {
            if (a.id === assignmentId) {
                return {
                    ...a,
                    submissions: {
                        ...a.submissions,
                        [studentId]: { status: "Submitted", file, submissionDate: new Date().toISOString().slice(0, 10) }
                    }
                };
            }
            return a;
        }));
        showNotification("Assignment submitted successfully!");
    };
    
    const addVideo = (video: Omit<Video, 'id' | 'url'> & { url: string }) => {
        // Basic URL validation and embedding conversion
        let url = video.url;
        if (url.includes("watch?v=")) {
            url = url.replace("watch?v=", "embed/");
        }
        const newVideo = { ...video, id: Date.now(), url };
        setVideos(prev => [newVideo, ...prev]);
        showNotification(`New video lecture added: "${video.title}"`);
    };

    const addUser = (user: Omit<User, 'id'>) => {
        const id = `${user.role}${Date.now()}`;
        const newUser = { ...user, id };
        setUsers(prev => ({ ...prev, [id]: newUser }));
        if (user.role === 'student') {
            setFees(prev => ({ ...prev, [id]: { total: 5000, paid: 0, pending: 5000 } }));
            setAttendance(prev => ({ ...prev, [id]: {} }));
        }
    };
    
    const updateUser = (id: string, updatedData: Partial<User>) => {
        setUsers(prev => ({ ...prev, [id]: { ...prev[id], ...updatedData } }));
    };

    const updateFee = (studentId: string, newFee: { total: string; paid: string }) => {
        const total = Number(newFee.total);
        const paid = Number(newFee.paid);
        const pending = total - paid;
        setFees(prev => ({...prev, [studentId]: { total, paid, pending }}));
    };

    const value = {
        users, teachers, students,
        notices,
        attendance,
        assignments,
        videos,
        fees,
        addNotice, togglePinNotice, deleteNotice,
        markAttendance,
        addAssignment, submitAssignment,
        addVideo,
        addUser, updateUser,
        updateFee,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// --- AUTHENTICATION --- //
const AuthContext = createContext(null!);

const useAuth = () => {
    return useContext(AuthContext);
};

// Fix: Added explicit type for children prop to resolve error.
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // Fix: Typed user state for type safety.
    const [user, setUser] = useState<User | null>(null);
    const { users } = useData();

    const login = (username: string, password: string) => {
        // Fix: Type inference for foundUser is now correct due to typed 'users' state.
        const foundUser = Object.values(users).find(u => u.username === username && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// --- GENERIC COMPONENTS --- //
// Fix: Added explicit props type (CardProps) to resolve errors about missing children prop.
const Card = ({ title, icon, children, className = '' }: CardProps) => (
    <div className={`card ${className}`}>
        <div className="card-header">
            <span className="icon">{icon}</span>
            <h3>{title}</h3>
        </div>
        <div className="card-content">{children}</div>
    </div>
);

// Fix: Added explicit props type (ModalProps) to resolve errors about missing children prop.
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- ADMIN COMPONENTS --- //
const AdminOverview = () => {
    const { students, teachers, fees } = useData();
    // Fix: Type inference for f.paid and f.pending is now correct due to typed 'fees' state.
    const totalFeesCollected = Object.values(fees).reduce((sum, f) => sum + f.paid, 0);
    const totalPendingFees = Object.values(fees).reduce((sum, f) => sum + f.pending, 0);

    return (
        <div className="dashboard-grid">
            <div className="card stat-card">
                <h3>{students.length}</h3>
                <p>Total Students</p>
            </div>
            <div className="card stat-card">
                <h3>{teachers.length}</h3>
                <p>Total Teachers</p>
            </div>
            <div className="card stat-card">
                <h3>₹{totalFeesCollected.toLocaleString()}</h3>
                <p>Fees Collected</p>
            </div>
            <div className="card stat-card">
                <h3>₹{totalPendingFees.toLocaleString()}</h3>
                <p>Pending Fees</p>
            </div>
        </div>
    );
}

const UserManagement = () => {
    const { users, addUser, updateUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userData = Object.fromEntries(formData.entries()) as Omit<User, 'id'>;
        if (editingUser) {
            updateUser(editingUser.id, userData);
        } else {
            addUser(userData);
        }
        setIsModalOpen(false);
    };

    return (
        <Card title="User Management" icon={icons.users}>
            <button className="btn btn-sm" onClick={openAddModal}>Add New User</button>
            <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {/* Fix: User properties are now correctly typed, resolving access errors. */}
                        {Object.values(users).map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                                <td>
                                    <button className="btn btn-sm" onClick={() => openEditModal(user)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit User" : "Add User"}>
                <form onSubmit={handleFormSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input name="name" defaultValue={editingUser?.name} required />
                    </div>
                    <div className="input-group">
                        <label>Username</label>
                        <input name="username" defaultValue={editingUser?.username} required />
                    </div>
                     <div className="input-group">
                        <label>Password</label>
                        <input name="password" defaultValue={editingUser?.password} required />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select name="role" defaultValue={editingUser?.role || 'student'} required>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button type="submit" className="btn">{editingUser ? "Update User" : "Create User"}</button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
};

const FeesManagement = () => {
    const { students, fees, updateFee } = useData();
    const [editingFee, setEditingFee] = useState<{ studentId: string } & Fee | null>(null);

    const handleFeeUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingFee) return;
        const formData = new FormData(e.currentTarget);
        const feeData = Object.fromEntries(formData.entries()) as { total: string; paid: string };
        updateFee(editingFee.studentId, feeData);
        setEditingFee(null);
    };

    return (
        <Card title="Fees Management" icon={icons.fees}>
             <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Student</th><th>Total</th><th>Paid</th><th>Pending</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>₹{fees[student.id]?.total.toLocaleString()}</td>
                                <td>₹{fees[student.id]?.paid.toLocaleString()}</td>
                                <td>₹{fees[student.id]?.pending.toLocaleString()}</td>
                                <td><button className="btn btn-sm" onClick={() => setEditingFee({ studentId: student.id, ...fees[student.id] })}>Update</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={!!editingFee} onClose={() => setEditingFee(null)} title="Update Fee Record">
                <form onSubmit={handleFeeUpdate}>
                     <div className="input-group">
                        <label>Total Fees</label>
                        <input name="total" type="number" defaultValue={editingFee?.total} required />
                    </div>
                    <div className="input-group">
                        <label>Paid Amount</label>
                        <input name="paid" type="number" defaultValue={editingFee?.paid} required />
                    </div>
                    <div className="btn-group">
                        <button type="submit" className="btn">Update Fees</button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
};

// --- TEACHER COMPONENTS --- //
const TeacherAttendance = () => {
    const { students, attendance, markAttendance } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
        markAttendance(studentId, selectedDate, status);
    };

    return (
        <Card title="Mark Attendance" icon={icons.attendance}>
            <div className="input-group">
                <label>Select Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Student</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'present')} 
                                            className={`btn btn-sm ${attendance[student.id]?.[selectedDate] === 'present' ? 'btn-success' : 'btn-secondary'}`}>Present</button>
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'absent')} 
                                            className={`btn btn-sm ${attendance[student.id]?.[selectedDate] === 'absent' ? 'btn-danger' : 'btn-secondary'}`}>Absent</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const TeacherAssignments = () => {
    const { assignments, addAssignment, students } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);

    const handleAddAssignment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as Omit<Assignment, 'id' | 'submissions'>;
        addAssignment(data);
        setIsModalOpen(false);
    };
    
    return (
         <Card title="Assignments & Quizzes" icon={icons.assignment}>
            <button className="btn btn-sm" onClick={() => setIsModalOpen(true)}>Post New Assignment</button>
            <ul className="assignment-list">
                {assignments.map(a => (
                    <li key={a.id} className="list-item">
                        <h4>{a.title} ({a.subject})</h4>
                        <p>Due: {a.dueDate}</p>
                        <button className="btn btn-sm btn-secondary" onClick={() => setViewingSubmissions(a)}>
                           View Submissions ({Object.keys(a.submissions).length}/{students.length})
                        </button>
                    </li>
                ))}
            </ul>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Assignment">
                <form onSubmit={handleAddAssignment}>
                    <div className="input-group">
                        <label>Title</label>
                        <input name="title" required />
                    </div>
                     <div className="input-group">
                        <label>Subject</label>
                        <input name="subject" required />
                    </div>
                    <div className="input-group">
                        <label>Due Date</label>
                        <input name="dueDate" type="date" required />
                    </div>
                    <button type="submit" className="btn">Post Assignment</button>
                </form>
            </Modal>
             <Modal isOpen={!!viewingSubmissions} onClose={() => setViewingSubmissions(null)} title={`Submissions for "${viewingSubmissions?.title}"`}>
                {Object.keys(viewingSubmissions?.submissions || {}).length === 0 ? <p>No submissions yet.</p> : (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Student</th><th>File</th><th>Submitted On</th></tr></thead>
                            <tbody>
                                {viewingSubmissions && students.filter(s => viewingSubmissions.submissions[s.id]).map(s => {
                                    const sub = viewingSubmissions.submissions[s.id];
                                    return (
                                        <tr key={s.id}>
                                            <td>{s.name}</td>
                                            <td>{sub.file}</td>
                                            <td>{sub.submissionDate}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

const TeacherVideos = () => {
    const { videos, addVideo } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddVideo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        addVideo(Object.fromEntries(formData.entries()) as Omit<Video, 'id'> & { url: string });
        setIsModalOpen(false);
    };
    
    return (
        <Card title="Video Lectures" icon={icons.video}>
            <button className="btn btn-sm" onClick={() => setIsModalOpen(true)}>Add New Video</button>
            <VideoList videos={videos} />
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Video Lecture">
                <form onSubmit={handleAddVideo}>
                    <div className="input-group"><label>Title</label><input name="title" required /></div>
                    <div className="input-group"><label>Subject</label><input name="subject" required /></div>
                    <div className="input-group"><label>YouTube URL</label><input name="url" type="url" required /></div>
                    <button type="submit" className="btn">Add Video</button>
                </form>
            </Modal>
        </Card>
    );
};


// --- STUDENT COMPONENTS --- //
const NoticeBoard = () => {
    const { notices, togglePinNotice, deleteNotice } = useData();
    const { user } = useAuth();
    // Fix: Added a null check for user to prevent potential runtime errors.
    if (!user) return null;
    // Fix: Changed boolean subtraction to use Number() to resolve arithmetic operation error.
    const sortedNotices = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card title="Notice Board" icon={icons.notice}>
            <ul className="notice-list">
                {sortedNotices.map(notice => (
                    <li key={notice.id} className="list-item">
                        <div className="notice-item-header">
                            <div>
                                <h4>{notice.pinned && '📌 '}{notice.title}</h4>
                            </div>
                            <div className="notice-meta">
                                <span>{notice.author}</span>
                                <span>{notice.date}</span>
                            </div>
                        </div>
                        <p className="notice-content">{notice.content}</p>
                        {user.role === 'admin' && (
                             <div className="btn-group" style={{justifyContent: 'flex-end'}}>
                                <button className="btn btn-sm btn-secondary" onClick={() => togglePinNotice(notice.id)}>{notice.pinned ? 'Unpin' : 'Pin'}</button>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteNotice(notice.id)}>Delete</button>
                             </div>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const StudentAttendance = () => {
    const { user } = useAuth();
    // Fix: Added a null check for user to prevent potential runtime errors.
    if (!user) return null;
    const { attendance } = useData();
    const studentAttendance = attendance[user.id] || {};
    
    const { present, total } = useMemo(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let present = 0;
        let total = 0;

        for (let day = 1; day <= daysInMonth; day++) {
             const d = new Date(year, month, day);
             if (d.getDay() === 0) continue; // Skip Sundays
             if (d > new Date()) break;
             const dateString = d.toISOString().slice(0, 10);
             if(studentAttendance[dateString]) total++;
             if(studentAttendance[dateString] === 'present') present++;
        }
        return { present, total };
    }, [studentAttendance]);
    
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    const barClass = percentage >= 75 ? 'good-attendance' : 'low-attendance';

    return (
        <Card title="Monthly Attendance" icon={icons.attendance}>
            <p>Your attendance for this month is <strong>{percentage}%</strong>.</p>
            <div className="progress-bar">
                <div className={`progress-bar-fill ${barClass}`} style={{ width: `${percentage}%` }}>
                    {percentage}%
                </div>
            </div>
            <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                {present} days present out of {total} working days.
            </p>
        </Card>
    );
};

const StudentAssignments = () => {
    const { assignments, submitAssignment } = useData();
    const { user } = useAuth();
    // Fix: Added a null check for user to prevent potential runtime errors.
    if (!user) return null;
    
    const handleSubmit = (assignmentId: number) => {
        // Mock file submission
        submitAssignment(assignmentId, user.id, `${user.username}_submission.pdf`);
    };

    return (
        <Card title="Assignments & Quizzes" icon={icons.assignment}>
            <ul className="assignment-list">
                {assignments.map(a => {
                    const submission = a.submissions[user.id];
                    return (
                        <li key={a.id} className="list-item">
                            <h4>{a.title} ({a.subject})</h4>
                            <p>Due: {a.dueDate}</p>
                            {submission ? (
                                <p style={{color: 'var(--success-color)'}}>Status: {submission.status} on {submission.submissionDate}</p>
                            ) : (
                                <button className="btn btn-sm" onClick={() => handleSubmit(a.id)}>Submit Now</button>
                            )}
                        </li>
                    )
                })}
            </ul>
        </Card>
    );
};

const VideoList = ({ videos }: { videos: Video[] }) => {
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    // Fix: Typed the accumulator in reduce to resolve 'map does not exist' error.
    const videosBySubject = videos.reduce((acc, video) => {
        (acc[video.subject] = acc[video.subject] || []).push(video);
        return acc;
    }, {} as { [key: string]: Video[] });

    return (
        <div>
            {Object.entries(videosBySubject).map(([subject, subjectVideos]) => (
                <div key={subject}>
                    <h4 style={{ marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{subject}</h4>
                    <ul className="video-list">
                        {subjectVideos.map(v => (
                            <li key={v.id} className="list-item" onClick={() => setPlayingVideo(v)} style={{cursor: 'pointer'}}>
                                {v.title}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <Modal isOpen={!!playingVideo} onClose={() => setPlayingVideo(null)} title={playingVideo?.title}>
                <iframe 
                    width="100%" 
                    height="315" 
                    src={playingVideo?.url}
                    title={playingVideo?.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                </iframe>
            </Modal>
        </div>
    );
}

const StudentVideos = () => {
    const { videos } = useData();
    return (
         <Card title="Video Lectures" icon={icons.video}>
            <VideoList videos={videos} />
        </Card>
    );
};

const StudentFees = () => {
    const { user } = useAuth();
    // Fix: Added a null check for user to prevent potential runtime errors.
    if (!user) return null;
    const { fees } = useData();
    const myFees = fees[user.id];
    const statusColor = myFees.pending > 0 ? 'var(--danger-color)' : 'var(--success-color)';

    return (
        <Card title="Fee Status" icon={icons.fees}>
            <ul className="fee-list">
                <li className="list-item"><strong>Total Fees:</strong> ₹{myFees.total.toLocaleString()}</li>
                <li className="list-item"><strong>Amount Paid:</strong> ₹{myFees.paid.toLocaleString()}</li>
                <li className="list-item" style={{ color: statusColor }}><strong>Pending Balance:</strong> ₹{myFees.pending.toLocaleString()}</li>
            </ul>
        </Card>
    );
};

// --- DASHBOARDS --- //
const AdminDashboard = () => (
    <>
        <AdminOverview />
        <div className="dashboard-grid">
             <UserManagement />
             <FeesManagement />
             <NoticeBoard />
        </div>
    </>
);

const TeacherDashboard = () => (
    <div className="dashboard-grid">
        <NoticeBoard />
        <TeacherAttendance />
        <TeacherAssignments />
        <TeacherVideos />
    </div>
);

const StudentDashboard = () => (
    <div className="dashboard-grid">
        <NoticeBoard />
        <StudentAttendance />
        <StudentAssignments />
        <StudentFees />
        <StudentVideos />
    </div>
);


// --- MAIN APP --- //
const App = () => {
    const { user, login, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!login(username, password)) {
            setError('Invalid username or password.');
        } else {
            setError('');
        }
    };
    
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    if (!user) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h1>Welcome Back!</h1>
                    <p>Login to manage your coaching center.</p>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn">Login</button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </div>
            </div>
        );
    }
    
    const renderDashboard = () => {
        switch (user.role) {
            case 'admin': return <AdminDashboard />;
            case 'teacher': return <TeacherDashboard />;
            case 'student': return <StudentDashboard />;
            default: return null;
        }
    };

    return (
        <>
            <header className="app-header">
                <div className="header-left">
                    <h2>Coaching Center</h2>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span>Welcome, {user.name}</span>
                        <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </div>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? icons.moon : icons.sun}
                    </button>
                    <button onClick={logout} className="logout-btn">
                        {icons.logout} Logout
                    </button>
                </div>
            </header>
            <main className="app-container">
                {renderDashboard()}
            </main>
        </>
    );
};


const Root = () => (
    <>
        {/* Fix: Wrapped providers with fragments which is fine, errors were due to missing children prop types in providers. */}
        <DataProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </DataProvider>
        <Analytics />
    </>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../../utils/api';
import PublicNavbar from './PublicNavbar';
import UserNavbar from './UserNavbar';
import DoctorNavbar from './DoctorNavbar';
import AdminNavbar from './AdminNavbar';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);

    const visibleNavbarPaths = [
        '/',
        '/chat',
        '/profile',
        '/change-password',
        '/report-list',
        '/enterInfo',
        '/patient-status',
        '/patient-status/Severe',
        '/patient-status/mild',
        '/route/guide',
        '/admin/dashboard',
        '/report-chatbot',
        '/history-report-chatbot'
    ];

    const visibleNavbarPrefixes = [
        '/report-list/',
        '/patient-status/',
    ];

    const shouldShowNavbar = () => {
        if (visibleNavbarPaths.includes(location.pathname)) {
            return true;
        }
        return visibleNavbarPrefixes.some(prefix =>
            location.pathname.startsWith(prefix)
        );
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleLogout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
            setUserData(null);
            setUserRole(null);
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const checkAuthAndGetUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await userApi.getCurrentUser();
                    setUserData(response.data.data);
                    setUserRole(response.data.data.role);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('User data fetch error:', error);
                    handleLogout();
                }
            } else {
                setIsAuthenticated(false);
                setUserData(null);
                setUserRole(null);
            }
        };

        checkAuthAndGetUser();
    }, [handleLogout]);

    if (!shouldShowNavbar()) {
        return null;
    }

    const renderNavbar = () => {
        if (!isAuthenticated) {
            return <PublicNavbar handleLogoClick={handleLogoClick} />;
        }

        const navbarProps = {
            userData,
            handleLogout,
            navigate,
            handleLogoClick
        };

        switch (userRole) {
            case 'user':
                return <UserNavbar {...navbarProps} />;
            case 'doctor':
                return <DoctorNavbar {...navbarProps} />;
            case 'admin':
                return <AdminNavbar {...navbarProps} />;
            default:
                return <PublicNavbar handleLogoClick={handleLogoClick} />;
        }
    };

    return renderNavbar();
};

export default Navbar;
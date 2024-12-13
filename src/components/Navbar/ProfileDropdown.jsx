// components/Navbar/ProfileDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ userData, handleLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="settings-menu" ref={dropdownRef}>
            <button
                className="settings-button"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <i className="fas fa-cog"></i>
                {userData?.username && (
                    <span className="username-display">{userData.username}</span>
                )}
            </button>
            {showDropdown && (
                <div className="settings-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fas fa-user"></i> 프로필 정보
                    </Link>
                    <Link to="/change-password" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fas fa-key"></i> 비밀번호 변경
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                        <i className="fas fa-sign-out-alt"></i> 로그아웃
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
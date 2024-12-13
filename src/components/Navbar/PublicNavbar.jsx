// components/Navbar/PublicNavbar.jsx
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const PublicNavbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="로고" className="logo-image" />
                </Link>
                <div className="auth-buttons">
                    <Link to="/login" className="auth-btn login-btn">
                        로그인
                    </Link>
                    <Link to="/signup" className="auth-btn signup-btn">
                        회원가입
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
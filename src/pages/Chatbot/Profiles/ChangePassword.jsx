import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { userApi, authApi } from '../../../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import './ChangePassword.css';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = '현재 비밀번호가 필요합니다';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = '새 비밀번호가 필요합니다';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = '새 비밀번호는 최소 8자 이상이어야 합니다';
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '새 비밀번호를 확인해 주세요';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('모든 필수 항목을 확인해 주세요');
            return;
        }

        setIsSubmitting(true);
        try {
            await userApi.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setShowSuccessModal(true);

        } catch (error) {
            const errorMessage = error.response?.data?.message || '비밀번호 변경에 실패했습니다';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success Modal Component
    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>성공!</h3>
                    <p>비밀번호가 성공적으로 변경되었습니다.</p>
                    <p>로그인 페이지로 리디렉션됩니다.</p>
                    <button
                        onClick={handleLogout}
                        className="modal-button"
                    >
                        확인
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="change-password-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="change-password-form">
                <h2>비밀번호 변경</h2>
                <p className="form-description">
                    현재 비밀번호를 입력하고 새 비밀번호를 선택해 주세요
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className={errors.currentPassword ? 'error' : ''}
                            placeholder="현재 비밀번호를 입력해 주세요"
                        />
                        {errors.currentPassword && (
                            <span className="error-message">{errors.currentPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={errors.newPassword ? 'error' : ''}
                            placeholder="새 비밀번호를 입력해 주세요"
                        />
                        {errors.newPassword && (
                            <span className="error-message">{errors.newPassword}</span>
                        )}
                        <span className="password-requirements">
                            비밀번호는 최소 8자 이상이어야 합니다
                        </span>
                    </div>

                    <div className="form-group">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                            placeholder="새 비밀번호를 확인해 주세요"
                        />
                        {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    >
                        {isSubmitting ? '비밀번호 변경 중...' : '비밀번호 변경'}
                    </button>
                </form>
            </div>
            <SuccessModal />
        </div>
    );
};

export default ChangePasswordPage;
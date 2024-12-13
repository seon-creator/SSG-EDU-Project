import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../../utils/api';
import './ProfilePage.css';

// 모달 컴포넌트
const Modal = ({ isOpen, onClose, title, message, type }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className={`modal-title ${type}`}>{title}</h3>
                <p className="modal-message">{message}</p>
                <button onClick={onClose} className="modal-button">닫기</button>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        email: '',
        userId: '',
        firstName: '',
        lastName: '',
        fullName: '',
        role: '',
        verified: false,
        status: '',
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
        bloodGroup: '',
        healthHistory: ''
    });

    const [originalProfile, setOriginalProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 모달 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: '',
        type: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const showModal = (title, message, type) => {
        setModalContent({ title, message, type });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const fetchProfile = useCallback(async () => {
        try {
            const response = await userApi.getCurrentUser();
            if (response.data.success) {
                const userData = response.data.data;
                const profileData = {
                    email: userData.email || '',
                    userId: userData.userId || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    fullName: userData.fullName || '',
                    role: userData.role || '',
                    verified: userData.verified || false,
                    status: userData.status || '',
                    dateOfBirth: formatDate(userData.dateOfBirth) || '',
                    gender: userData.gender || '',
                    height: userData.height || '',
                    weight: userData.weight || '',
                    bloodGroup: userData.bloodGroup || '',
                    healthHistory: userData.healthHistory || ''
                };

                setProfile(profileData);
                setOriginalProfile(profileData);
            }
        } catch (err) {
            console.error('프로필을 불러오는 중 오류 발생:', err);
            showModal('오류', '프로필을 불러오지 못했습니다', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setIsEditing(false);
    };

    const validateProfile = () => {
        if (!profile.firstName.trim() || !profile.lastName.trim()) {
            showModal('오류', '이름과 성은 필수 항목입니다', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!isEditing) return;

        const hasChanges = Object.keys(profile).some(key =>
            profile[key] !== originalProfile[key] &&
            !['email', 'userId', 'role', 'verified', 'status', 'fullName'].includes(key)
        );

        if (!hasChanges) {
            showModal('경고', '변경 사항이 없습니다', 'error');
            return;
        }

        if (!validateProfile()) return;

        const updateData = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            dateOfBirth: profile.dateOfBirth || undefined,
            gender: profile.gender || undefined,
            height: profile.height || undefined,
            weight: profile.weight || undefined,
            bloodGroup: profile.bloodGroup || undefined,
            healthHistory: profile.healthHistory || undefined
        };

        setUpdating(true);
        try {
            const response = await userApi.updateCurrentUser(updateData);
            if (response.data.success) {
                showModal('성공', '프로필이 성공적으로 업데이트되었습니다', 'success');
                setIsEditing(false);
                await fetchProfile();
            } else {
                showModal('오류', response.data.message || '프로필 업데이트 실패', 'error');
            }
        } catch (err) {
            showModal('오류', err.response?.data?.message || '프로필 업데이트 실패', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>프로필을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={modalContent.title}
                message={modalContent.message}
                type={modalContent.type}
            />

            <div className="profile-container">
                <h1>프로필 정보</h1>

                <div className="profile-form">
                    <div className="form-grid">
                        {/* 읽기 전용 필드 */}
                        <div className="form-group">
                            <label>이메일</label>
                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="readonly-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>사용자 ID</label>
                            <input
                                type="text"
                                value={profile.userId}
                                readOnly
                                className="readonly-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>역할</label>
                            <input
                                type="text"
                                value={profile.role}
                                readOnly
                                className="readonly-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>상태</label>
                            <input
                                type="text"
                                value={profile.status}
                                readOnly
                                className="readonly-field"
                            />
                        </div>

                        {/* 편집 가능한 필드 */}
                        <div className="form-group">
                            <label>이름 *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>

                        <div className="form-group">
                            <label>성 *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>

                        <div className="form-group">
                            <label>성별</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            >
                                <option value="">성별 선택</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                                <option value="other">기타</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>생년월일</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profile.dateOfBirth}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>

                        <div className="form-group">
                            <label>키 (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={profile.height}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>

                        <div className="form-group">
                            <label>몸무게 (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={profile.weight}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>

                        <div className="form-group">
                            <label>혈액형</label>
                            <input
                                type="text"
                                name="bloodGroup"
                                value={profile.bloodGroup}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'disabled-field' : ''}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>건강 이력</label>
                        <textarea
                            name="healthHistory"
                            value={profile.healthHistory}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'disabled-field' : ''}
                            rows="4"
                        />
                    </div>

                    <div className="button-group">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="edit-button"
                            >
                                프로필 편집
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="save-button"
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            저장 중...
                                        </>
                                    ) : (
                                        '변경 사항 저장'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="cancel-button"
                                    disabled={updating}
                                >
                                    취소
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
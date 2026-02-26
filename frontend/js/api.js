const API_BASE_URL = '/api';
function getToken() {
    return localStorage.getItem('lms_token');
}
function setToken(token) {
    localStorage.setItem('lms_token', token);
}
function removeToken() {
    localStorage.removeItem('lms_token');
}
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = {
        ...options,
        headers,
    };
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
const authAPI = {
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: userData,
        skipAuth: true,
    }),
    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
    }),
    getProfile: () => apiRequest('/auth/profile'),
};
const bankAPI = {
    setupAccount: (accountData) => apiRequest('/bank/setup', {
        method: 'POST',
        body: accountData,
    }),
    getBalance: () => apiRequest('/bank/balance'),
    getAccount: (accountNumber) => apiRequest(`/bank/account/${accountNumber}`),
};
const learnerAPI = {
    getAllCourses: () => apiRequest('/learner/courses'),
    enrollInCourse: (enrollmentData) => apiRequest('/learner/enroll', {
        method: 'POST',
        body: enrollmentData,
    }),
    getMyEnrollments: () => apiRequest('/learner/my-courses'),
    getCourseMaterials: (courseId) => apiRequest(`/learner/courses/${courseId}/materials`),
    completeCourse: (courseId) => apiRequest('/learner/complete-course', {
        method: 'POST',
        body: { course_id: courseId },
    }),
    getCertificates: () => apiRequest('/learner/certificates'),
    topUp: (data) => apiRequest('/learner/topup', { method: 'POST', body: data }),
};
const instructorAPI = {
    uploadCourse: (courseData) => apiRequest('/instructor/courses', {
        method: 'POST',
        body: courseData,
    }),
    uploadMaterial: (materialData) => apiRequest('/instructor/materials', {
        method: 'POST',
        body: materialData,
    }),
    getMyCourses: () => apiRequest('/instructor/my-courses'),
    getPendingTransactions: () => apiRequest('/instructor/pending-transactions'),
    claimPayment: (paymentData) => apiRequest('/instructor/claim-payment', {
        method: 'POST',
        body: paymentData,
    }),
};
const adminAPI = {
    getInstructorStats: () => apiRequest('/admin/instructor-stats'),
    getBalance: () => apiRequest('/admin/balance'),
    getSystemStats: () => apiRequest('/admin/system-stats'),
    getAllTransactions: () => apiRequest('/admin/transactions'),
    addTopic: (topicData) => apiRequest('/admin/topic', {
        method: 'POST',
        body: topicData,
    }),
    removeTopic: (id) => apiRequest(`/admin/topic/${id}`, { method: 'DELETE' }),
    addInstructor: (instructorData) => apiRequest('/admin/instructor', {
        method: 'POST',
        body: instructorData,
    }),
    removeInstructor: (id) => apiRequest(`/admin/instructor/${id}`, { method: 'DELETE' }),
};
const publicAPI = {
    getTopics: () => apiRequest('/public/topics', { skipAuth: true }),
};
const API = {
    auth: authAPI,
    bank: bankAPI,
    learner: learnerAPI,
    instructor: instructorAPI,
    admin: adminAPI,
    public: publicAPI,
    getToken,
    setToken,
    removeToken,
};

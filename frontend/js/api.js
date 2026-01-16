// API Client for LMS System
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('lms_token');
}

// Set token in localStorage
function setToken(token) {
    localStorage.setItem('lms_token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('lms_token');
}

// Generic API request function
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

// Auth API
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

// Bank API
const bankAPI = {
    setupAccount: (accountData) => apiRequest('/bank/setup', {
        method: 'POST',
        body: accountData,
    }),

    getBalance: () => apiRequest('/bank/balance'),

    getAccount: (accountNumber) => apiRequest(`/bank/account/${accountNumber}`, {
        skipAuth: true,
    }),
};

// Learner API
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
};

// Instructor API
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

// Export all APIs
const API = {
    auth: authAPI,
    bank: bankAPI,
    learner: learnerAPI,
    instructor: instructorAPI,
    getToken,
    setToken,
    removeToken,
};

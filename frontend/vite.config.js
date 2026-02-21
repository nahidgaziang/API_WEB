import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 8080,
        open: true,
        cors: true
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html',
                login: './login.html',
                register: './register.html',
                learnerDashboard: './learner/dashboard.html',
                learnerCourses: './learner/courses.html',
                learnerMyCourses: './learner/my-courses.html',
                learnerCourseView: './learner/course-view.html',
                learnerCertificates: './learner/certificates.html',
                learnerBankSetup: './learner/bank-setup.html',
                instructorDashboard: './instructor/dashboard.html',
                instructorUploadCourse: './instructor/upload-course.html',
                instructorUploadMaterials: './instructor/upload-materials.html',
                instructorBankSetup: './instructor/bank-setup.html',
            }
        }
    }
});

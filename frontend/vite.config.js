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
                register: './register.html'
            }
        }
    }
});

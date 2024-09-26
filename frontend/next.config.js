/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://192.168.1.152:8080/api/:path*', // Updated to use localhost
            },
        ]
    },
}

module.exports = nextConfig
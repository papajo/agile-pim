/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Changed from 'true' to an empty object '{}' to match expected type
    serverActions: {},
  },
  // --- Build Error Suppression Removed ---
  // It's recommended to fix linting and type errors rather than ignoring them.
  // Keeping these enabled helps maintain code quality and prevent runtime issues.
  // eslint: {
  //   ignoreDuringBuilds: true, // Removed/Commented out
  // },
  // typescript: {
  //   ignoreBuildErrors: true, // Removed/Commented out
  // },
  // --- End Removal ---
  images: {
    unoptimized: true, // Keep this if needed for deployment environment (e.g., static export)
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["ffmpeg-static"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos"
      }
    ]
  }
};

export default nextConfig;

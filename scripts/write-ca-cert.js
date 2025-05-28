// scripts/write-ca-cert.js
import fs from 'fs';
import path from 'path';

const certContent = process.env.CA_CERT_CONTENT;
const certPath = '/tmp/ca.pem'; // 与 DATABASE_URL 中的路径一致

// 仅当在 Vercel 环境且 CA_CERT_CONTENT 存在时执行
if (certContent) { 
  try {
    // 确保 /tmp 目录存在 (通常在 Vercel 构建和运行时环境中是存在的)
    const dir = path.dirname(certPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(certPath, certContent);
    console.log(`CA certificate successfully written to ${certPath}`);
  } catch (error) {
    console.error(`Error writing CA certificate to ${certPath}:`, error);
    process.exit(1); // 如果写入失败，则构建失败
  }
} else {
  console.log('Skipping CA certificate writing (CA_CERT_CONTENT not set or not in Vercel environment).');
}
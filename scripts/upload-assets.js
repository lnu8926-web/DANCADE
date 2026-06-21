// scripts/upload-assets.js
// Supabase Storage에 public/ 게임 에셋을 업로드하는 스크립트
// 실행: node scripts/upload-assets.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const BUCKET_NAME = "game-assets";
const PUBLIC_DIR = path.join(__dirname, "../public");
const UPLOAD_FOLDERS = ["assets", "tilesets", "maps"];

const MIME_TYPES = {
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".tmj": "application/json",
  ".woff": "font/woff",
};

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      files.push({ fullPath, relativePath });
    }
  }
  return files;
}

async function createBucket(supabase) {
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    allowedMimeTypes: ["image/*", "application/json", "font/*"],
  });
  if (error && !error.message.includes("already exists")) {
    throw new Error(`버킷 생성 실패: ${error.message}`);
  }
  console.log(`✅ 버킷 '${BUCKET_NAME}' 준비 완료`);
}

async function uploadBatch(supabase, files) {
  return Promise.all(
    files.map(async ({ fullPath, relativePath }) => {
      const ext = path.extname(relativePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const fileBuffer = fs.readFileSync(fullPath);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(relativePath, fileBuffer, { contentType, upsert: true });

      if (error) {
        console.error(`  ❌ ${relativePath}: ${error.message}`);
        return false;
      }
      return true;
    })
  );
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log("🚀 Supabase Storage 에셋 업로드 시작\n");
  await createBucket(supabase);

  const allFiles = [];
  for (const folder of UPLOAD_FOLDERS) {
    const folderPath = path.join(PUBLIC_DIR, folder);
    if (fs.existsSync(folderPath)) {
      allFiles.push(...getAllFiles(folderPath, PUBLIC_DIR));
    }
  }

  console.log(`📦 총 ${allFiles.length}개 파일 업로드 중...\n`);

  let success = 0;
  let failed = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    const results = await uploadBatch(supabase, batch);
    success += results.filter(Boolean).length;
    failed += results.filter((r) => !r).length;
    process.stdout.write(`\r  진행: ${Math.min(i + BATCH_SIZE, allFiles.length)} / ${allFiles.length}`);
  }

  const storageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`;

  console.log(`\n\n✅ 업로드 완료 — 성공: ${success}, 실패: ${failed}`);
  console.log("\n📋 .env.local에 아래 줄을 추가하세요:\n");
  console.log(`NEXT_PUBLIC_ASSET_URL=${storageUrl}\n`);
}

main().catch((err) => {
  console.error("❌ 오류:", err.message);
  process.exit(1);
});

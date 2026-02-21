import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

function createClient() {
  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) throw new Error("DATABASE_URL is not set in .env.local");
  return new PrismaClient({ adapter: new PrismaNeonHttp(connectionString, {}) });
}

const prisma = createClient();

async function main() {
  console.log("🌱 Seeding database...");

  // User
  const existingUser = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("password123", 12);
    const user = await prisma.user.create({
      data: { username: "admin", email: "admin@nba.com", password: hashedPassword, name: "Admin NBA Tech" },
    });
    console.log("✅ Created user:", user.username);
  } else {
    console.log("⏭️  User already exists:", existingUser.username);
  }

  // Master Data
  const masterDataItems = [
    { category: "JOB_TYPE", key: "ELECTRICAL",      value: "Electrical",      label: "งานไฟฟ้า",            sortOrder: 1 },
    { category: "JOB_TYPE", key: "MECHANICAL",      value: "Mechanical",      label: "งานเครื่องกล",        sortOrder: 2 },
    { category: "JOB_TYPE", key: "INSTRUMENTATION", value: "Instrumentation", label: "งาน Instrumentation", sortOrder: 3 },
    { category: "JOB_TYPE", key: "CIVIL",            value: "Civil",           label: "งานโยธา",             sortOrder: 4 },
    { category: "CLIENT_TYPE", key: "FACTORY",    value: "Factory",    label: "โรงงาน",               sortOrder: 1 },
    { category: "CLIENT_TYPE", key: "OFFICE",     value: "Office",     label: "อาคารสำนักงาน",        sortOrder: 2 },
    { category: "CLIENT_TYPE", key: "HOSPITAL",   value: "Hospital",   label: "โรงพยาบาล",            sortOrder: 3 },
    { category: "CLIENT_TYPE", key: "GOVERNMENT", value: "Government", label: "หน่วยงานราชการ",        sortOrder: 4 },
    { category: "PAYMENT_TERM", key: "NET30", value: "Net 30", label: "30 วัน",  sortOrder: 1 },
    { category: "PAYMENT_TERM", key: "NET60", value: "Net 60", label: "60 วัน",  sortOrder: 2 },
    { category: "PAYMENT_TERM", key: "COD",   value: "COD",    label: "เงินสด", sortOrder: 3 },
  ];

  let createdCount = 0;
  for (const item of masterDataItems) {
    const existing = await prisma.masterData.findUnique({
      where: { category_key: { category: item.category, key: item.key } },
    });
    if (!existing) {
      await prisma.masterData.create({ data: { ...item, isActive: true } });
      createdCount++;
    }
  }
  console.log(`✅ Master data: ${createdCount} created, ${masterDataItems.length - createdCount} already existed`);

  // Quotations
  const q1Existing = await prisma.quotation.findUnique({ where: { quotationNo: "QT2401-0001" } });
  let q1 = q1Existing;
  if (!q1Existing) {
    q1 = await prisma.quotation.create({
      data: {
        quotationNo: "QT2401-0001",
        clientName: "บริษัท ABC จำกัด",
        projectName: "ติดตั้งระบบไฟฟ้าโรงงาน",
        description: "ออกแบบและติดตั้งระบบไฟฟ้ากำลัง MDB, SDB, Wiring",
        amount: 1500000,
        status: "APPROVED",
      },
    });
    console.log("✅ Created quotation:", q1.quotationNo);
  }

  const q2Existing = await prisma.quotation.findUnique({ where: { quotationNo: "QT2401-0002" } });
  if (!q2Existing) {
    const q2 = await prisma.quotation.create({
      data: {
        quotationNo: "QT2401-0002",
        clientName: "บริษัท XYZ จำกัด",
        projectName: "ระบบโซลาร์เซลล์ 500kWp",
        description: "ออกแบบและติดตั้ง Solar Rooftop System",
        amount: 8500000,
        status: "SENT",
      },
    });
    console.log("✅ Created quotation:", q2.quotationNo);
  }

  // Job History
  const existingJobs = await prisma.jobHistory.count();
  if (existingJobs === 0 && q1) {
    await prisma.jobHistory.create({
      data: {
        quotationId: q1.id,
        jobName: "ติดตั้งระบบไฟฟ้าโรงงาน ABC",
        clientName: "บริษัท ABC จำกัด",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-30"),
        description: "งานติดตั้งระบบไฟฟ้า Phase 1",
        amount: 1500000,
        status: "COMPLETED",
      },
    });
    console.log("✅ Created sample job history");
  }

  console.log("\n🎉 Seed completed!");
  console.log("📧 Login: admin@nba.com");
  console.log("🔑 Password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

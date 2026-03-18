import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import ws from "ws";

config({ path: ".env.local" });

function createClient() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED is not set in .env.local");
  }

  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter });
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
    { category: "COMPANY_PROFILE", key: "COMPANY_NAME",    value: "บริษัท เอ็นบีเอ เทค เอ็นจิเนียริ่ง จำกัด", label: "ชื่อบริษัท",      sortOrder: 1 },
    { category: "COMPANY_PROFILE", key: "REGISTRATION_NO", value: "0105559999999",                                label: "เลขนิติบุคคล",   sortOrder: 2 },
    { category: "COMPANY_PROFILE", key: "ADDRESS",         value: "99/9 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", label: "ที่อยู่", sortOrder: 3 },
    { category: "COMPANY_PROFILE", key: "PHONE",           value: "02-123-4567",                                   label: "เบอร์โทรศัพท์", sortOrder: 4 },
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

  // Job History
  const existingJobs = await prisma.jobHistory.count();
  if (existingJobs === 0) {
    await prisma.jobHistory.create({
      data: {
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

  // Project File (sample)
  const existingPF = await prisma.projectFile.findUnique({ where: { projectCode: "1/2026" } });
  if (!existingPF) {
    const adminUser = await prisma.user.findUnique({ where: { username: "admin" } });
    const pf = await prisma.projectFile.create({
      data: {
        projectCode: "1/2026",
        projectName: "ปรับปรุงห้องพักโรงแรม Royal Suite",
        subject: "งานปรับปรุงตกแต่งภายใน ห้อง Deluxe จำนวน 10 ห้อง",
        customerName: "บริษัท โรยัล สวีท โฮเทล จำกัด",
        quotationNo: "QT-2026-001",
        revisionNo: "Rev.1",
        quotationDate: new Date("2026-02-17"),
        billTo: "บริษัท โรยัล สวีท โฮเทล จำกัด",
        dear: "คุณสมชาย ใจดี",
        supervisorName: "วิศวกร นายสมศักดิ์",
        paymentTermsText: "- ชำระ 30% เมื่อเซ็นสัญญา\n- ชำระ 40% เมื่องานแล้วเสร็จ 50%\n- ชำระส่วนที่เหลือเมื่องานแล้วเสร็จ",
        status: "DRAFT",
        subtotal: 850000,
        overheadPercent: 10,
        overheadAmount: 85000,
        total: 935000,
        discount: 0,
        grandTotal: 935000,
        amountTextTh: "เก้าแสนสามหมื่นห้าพันบาทถ้วน",
        createdById: adminUser?.id ?? null,
      },
    });
    await prisma.projectFileLine.createMany({
      data: [
        { projectFileId: pf.id, sortOrder: 1, lineType: "SECTION", itemNo: null, description: "งานรื้อถอน", quantity: null, unit: null, materialUnitPrice: null, materialAmount: null, laborUnitPrice: null, laborAmount: null, lineTotal: null },
        { projectFileId: pf.id, sortOrder: 2, lineType: "ITEM",    itemNo: "1",  description: "รื้อถอนพื้นเดิม",        quantity: 200, unit: "ตร.ม.", materialUnitPrice: 50,   materialAmount: 10000,  laborUnitPrice: 80,  laborAmount: 16000,  lineTotal: 26000  },
        { projectFileId: pf.id, sortOrder: 3, lineType: "ITEM",    itemNo: "2",  description: "รื้อถอนฝ้าเพดานเดิม",     quantity: 200, unit: "ตร.ม.", materialUnitPrice: 30,   materialAmount: 6000,   laborUnitPrice: 60,  laborAmount: 12000,  lineTotal: 18000  },
        { projectFileId: pf.id, sortOrder: 4, lineType: "SECTION", itemNo: null, description: "งานพื้น", quantity: null, unit: null, materialUnitPrice: null, materialAmount: null, laborUnitPrice: null, laborAmount: null, lineTotal: null },
        { projectFileId: pf.id, sortOrder: 5, lineType: "ITEM",    itemNo: "3",  description: "ปูกระเบื้องพอร์ซเลน 60x60", quantity: 200, unit: "ตร.ม.", materialUnitPrice: 380,  materialAmount: 76000,  laborUnitPrice: 120, laborAmount: 24000,  lineTotal: 100000 },
        { projectFileId: pf.id, sortOrder: 6, lineType: "SECTION", itemNo: null, description: "งานฝ้าเพดาน", quantity: null, unit: null, materialUnitPrice: null, materialAmount: null, laborUnitPrice: null, laborAmount: null, lineTotal: null },
        { projectFileId: pf.id, sortOrder: 7, lineType: "ITEM",    itemNo: "4",  description: "ฝ้ายิปซัมบอร์ด 9 มม.",    quantity: 200, unit: "ตร.ม.", materialUnitPrice: 220,  materialAmount: 44000,  laborUnitPrice: 90,  laborAmount: 18000,  lineTotal: 62000  },
        { projectFileId: pf.id, sortOrder: 8, lineType: "SECTION", itemNo: null, description: "งานสีภายใน", quantity: null, unit: null, materialUnitPrice: null, materialAmount: null, laborUnitPrice: null, laborAmount: null, lineTotal: null },
        { projectFileId: pf.id, sortOrder: 9, lineType: "ITEM",    itemNo: "5",  description: "ทาสีผนังภายใน 2 ชั้น",    quantity: 800, unit: "ตร.ม.", materialUnitPrice: 85,   materialAmount: 68000,  laborUnitPrice: 45,  laborAmount: 36000,  lineTotal: 104000 },
        { projectFileId: pf.id, sortOrder: 10, lineType: "NOTE",   itemNo: null, description: "* สีใช้ Dulux Weather Shield ชั้นคุณภาพ A" },
      ],
    });
    console.log("✅ Created sample project file: 1/2026");
  } else {
    console.log("⏭️  Project file 1/2026 already exists");
  }

  console.log("\n🎉 Seed completed!");
  console.log("👤 Username: admin");
  console.log("📧 Email: admin@nba.com");
  console.log("🔑 Password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

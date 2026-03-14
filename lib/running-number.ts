import { prisma } from "@/lib/prisma";

function getCurrentYear() {
  return new Date().getFullYear();
}

function extractRunningNo(value: string, year: number, prefix = "") {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escapedPrefix}(\\d+)\\/${year}$`);
  const match = value.match(regex);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export async function getNextProjectCode(year = getCurrentYear()) {
  const rows = await prisma.projectFile.findMany({
    where: { projectCode: { endsWith: `/${year}` } },
    select: { projectCode: true },
  });
  const max = rows.reduce((acc, row) => {
    const n = extractRunningNo(row.projectCode, year);
    return n && n > acc ? n : acc;
  }, 0);
  return `${max + 1}/${year}`;
}

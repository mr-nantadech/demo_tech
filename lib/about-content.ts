import type { MasterData } from "@prisma/client";

export const ABOUT_CONTENT_CATEGORY = "ABOUT_CONTENT";

export interface AboutContent {
  pageTitle: string;
  pageSubtitle: string;
  companyTagline: string;
  companyIntro: string;
  expertiseTitle: string;
  expertiseItems: string[];
}

export const defaultAboutContent: AboutContent = {
  pageTitle: "เกี่ยวกับเรา",
  pageSubtitle: "NBA Tech Engineer - ผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าและระบบอัตโนมัติ",
  companyTagline: "บริษัทวิศวกรรมชั้นนำ",
  companyIntro:
    "เราคือทีมวิศวกรมืออาชีพที่มีประสบการณ์มากกว่า 10 ปี ในด้านวิศวกรรมไฟฟ้า ระบบอัตโนมัติ และพลังงานทดแทน เราให้บริการออกแบบ ติดตั้ง และดูแลบำรุงรักษาระบบวิศวกรรมอย่างครบวงจร",
  expertiseTitle: "ความเชี่ยวชาญ",
  expertiseItems: [
    "ระบบไฟฟ้ากำลัง",
    "PLC & Automation",
    "Solar Energy",
    "BMS",
    "UPS & Generator",
    "HVAC Control",
    "IoT Systems",
    "Engineering Design",
  ],
};

function getValue(map: Map<string, string>, key: string, fallback: string) {
  const value = map.get(key)?.trim();
  return value || fallback;
}

export function buildAboutContent(
  rows: Pick<MasterData, "key" | "value">[]
): AboutContent {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const expertiseRaw = getValue(
    byKey,
    "EXPERTISE_ITEMS",
    defaultAboutContent.expertiseItems.join("\n")
  );

  return {
    pageTitle: getValue(
      byKey,
      "PAGE_TITLE",
      defaultAboutContent.pageTitle
    ),
    pageSubtitle: getValue(
      byKey,
      "PAGE_SUBTITLE",
      defaultAboutContent.pageSubtitle
    ),
    companyTagline: getValue(
      byKey,
      "COMPANY_TAGLINE",
      defaultAboutContent.companyTagline
    ),
    companyIntro: getValue(
      byKey,
      "COMPANY_INTRO",
      defaultAboutContent.companyIntro
    ),
    expertiseTitle: getValue(
      byKey,
      "EXPERTISE_TITLE",
      defaultAboutContent.expertiseTitle
    ),
    expertiseItems: expertiseRaw
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

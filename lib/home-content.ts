import type { MasterData } from "@prisma/client";

export const HOME_CONTENT_CATEGORY = "HOME_CONTENT";
export const HOME_SLIDE_COUNT = 4;
export const HOME_SERVICE_COUNT = 6;

export interface HomeSlideContent {
  image: string;
  title: string;
  subtitle: string;
  gradient: string;
}

export interface HomeServiceContent {
  no: number;
  title: string;
  desc: string;
  color: string;
}

export interface HomeContent {
  servicesTitle: string;
  servicesSubtitle: string;
  slides: HomeSlideContent[];
  services: HomeServiceContent[];
}

const defaultSlides: HomeSlideContent[] = [
  {
    image: "/portfolio/slide-1.jpg",
    title: "ติดตั้งระบบปรับอากาศ",
    subtitle: "ให้บริการติดตั้งและบำรุงรักษาระบบทำความเย็นครบวงจร",
    gradient: "linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1E88E5 100%)",
  },
  {
    image: "/portfolio/slide-2.jpg",
    title: "งานระบบไฟฟ้า",
    subtitle: "ออกแบบ ติดตั้ง และบำรุงรักษาระบบไฟฟ้าภายในอาคาร",
    gradient: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #43A047 100%)",
  },
  {
    image: "/portfolio/slide-3.jpg",
    title: "รับเหมาระบบวิศวกรรมประกอบอาคาร",
    subtitle: "ระบบไฟฟ้า ระบบเครื่องกล ระบบปรับอากาศ และระบบที่เกี่ยวข้อง",
    gradient: "linear-gradient(135deg, #4A148C 0%, #6A1B9A 60%, #8E24AA 100%)",
  },
  {
    image: "/portfolio/slide-4.jpg",
    title: "เติมสารทำความเย็นและตรวจเช็กระบบ",
    subtitle: "บริการล้าง ซ่อม รีชาร์จ โดยช่างผู้เชี่ยวชาญ",
    gradient: "linear-gradient(135deg, #004D40 0%, #00695C 60%, #00897B 100%)",
  },
];

const defaultServices: HomeServiceContent[] = [
  {
    no: 1,
    title: "ติดตั้ง ซ่อมแซม และบำรุงรักษาระบบปรับอากาศ",
    desc: "ให้บริการติดตั้ง ซ่อมแซม บำรุงรักษา ตรวจสอบ และปรับปรุงเครื่องปรับอากาศ ระบบทำความเย็น และระบบระบายอากาศทุกชนิด",
    color: "#1565C0",
  },
  {
    no: 2,
    title: "ล้าง ซ่อม และเติมสารทำความเย็น",
    desc: "ให้บริการล้าง ซ่อม รีเช็ต รีชาร์จ ตรวจเช็ก และเติมสารทำความเย็นเครื่องปรับอากาศและระบบทำความเย็น",
    color: "#0288D1",
  },
  {
    no: 3,
    title: "ระบบไฟฟ้าและระบบควบคุมไฟฟ้า",
    desc: "ให้บริการออกแบบ ติดตั้ง ซ่อมแซม และบำรุงรักษาระบบไฟฟ้า ระบบควบคุมไฟฟ้า และระบบไฟฟ้าภายในอาคาร",
    color: "#F57C00",
  },
  {
    no: 4,
    title: "รับเหมางานระบบวิศวกรรมประกอบอาคาร",
    desc: "รับเหมาติดตั้งงานระบบวิศวกรรมประกอบอาคาร ได้แก่ ระบบไฟฟ้า ระบบเครื่องกล ระบบปรับอากาศ และระบบที่เกี่ยวข้อง",
    color: "#2E7D32",
  },
  {
    no: 5,
    title: "จำหน่ายเครื่องปรับอากาศและอุปกรณ์",
    desc: "จำหน่าย จัดหา เครื่องปรับอากาศ อุปกรณ์ไฟฟ้า อุปกรณ์ทำความเย็น อะไหล่ และวัสดุที่เกี่ยวข้องกับกิจการ",
    color: "#6A1B9A",
  },
  {
    no: 6,
    title: "บริการอื่นที่เกี่ยวเนื่อง",
    desc: "ประกอบกิจการอื่นใดที่เกี่ยวเนื่องหรือคล้ายคลึงกันกับกิจการดังกล่าว ทั้งนี้ไม่ขัดต่อกฎหมาย",
    color: "#00695C",
  },
];

export const defaultHomeContent: HomeContent = {
  servicesTitle: "บริการของเรา",
  servicesSubtitle: "ให้บริการงานระบบวิศวกรรมครบวงจร โดยทีมช่างผู้เชี่ยวชาญ",
  slides: defaultSlides,
  services: defaultServices,
};

function getValue(map: Map<string, string>, key: string, fallback: string) {
  const value = map.get(key)?.trim();
  return value || fallback;
}

export function buildHomeContent(rows: Pick<MasterData, "key" | "value">[]): HomeContent {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    servicesTitle: getValue(
      byKey,
      "SERVICES_SECTION_TITLE",
      defaultHomeContent.servicesTitle
    ),
    servicesSubtitle: getValue(
      byKey,
      "SERVICES_SECTION_SUBTITLE",
      defaultHomeContent.servicesSubtitle
    ),
    slides: defaultHomeContent.slides.map((slide, idx) => {
      const index = idx + 1;
      return {
        image: getValue(byKey, `SLIDE_${index}_IMAGE`, slide.image),
        title: getValue(byKey, `SLIDE_${index}_TITLE`, slide.title),
        subtitle: getValue(byKey, `SLIDE_${index}_SUBTITLE`, slide.subtitle),
        gradient: slide.gradient,
      };
    }),
    services: defaultHomeContent.services.map((service, idx) => {
      const index = idx + 1;
      return {
        ...service,
        title: getValue(byKey, `SERVICE_${index}_TITLE`, service.title),
        desc: getValue(byKey, `SERVICE_${index}_DESC`, service.desc),
      };
    }),
  };
}

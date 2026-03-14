export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

function convertThaiInteger(num: number): string {
  if (num === 0) return "ศูนย์";

  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

  const convertUnderMillion = (n: number) => {
    if (n === 0) return "";
    const chars = String(n).split("").map(Number);
    const len = chars.length;
    let out = "";
    for (let i = 0; i < len; i++) {
      const d = chars[i];
      if (d === 0) continue;
      const pos = len - i - 1;

      if (pos === 0) {
        if (d === 1 && len > 1) out += "เอ็ด";
        else out += digits[d];
      } else if (pos === 1) {
        if (d === 1) out += "สิบ";
        else if (d === 2) out += "ยี่สิบ";
        else out += `${digits[d]}สิบ`;
      } else {
        out += `${digits[d]}${positions[pos]}`;
      }
    }
    return out;
  };

  let value = num;
  let result = "";
  while (value > 0) {
    const part = value % 1_000_000;
    const partText = convertUnderMillion(part);
    if (partText) {
      result = result ? `${partText}ล้าน${result}` : partText;
    } else if (result) {
      result = `ล้าน${result}`;
    }
    value = Math.floor(value / 1_000_000);
  }
  return result;
}

export function toThaiBahtText(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "";

  const fixed = value.toFixed(2);
  const [intPartStr, decPartStr] = fixed.split(".");
  const intPart = Number(intPartStr);
  const decPart = Number(decPartStr);

  const intText = convertThaiInteger(intPart);
  if (decPart === 0) {
    return `${intText}บาทถ้วน`;
  }

  const satangText = convertThaiInteger(decPart);
  return `${intText}บาท${satangText}สตางค์`;
}

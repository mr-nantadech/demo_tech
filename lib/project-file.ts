export type ProjectFileLineInput = {
  sortOrder: number;
  lineType: "SECTION" | "ITEM" | "NOTE";
  itemNo?: string | null;
  description: string;
  quantity?: number | null;
  unit?: string | null;
  materialUnitPrice?: number | null;
  materialAmount?: number | null;
  laborUnitPrice?: number | null;
  laborAmount?: number | null;
  lineTotal?: number | null;
  remark?: string | null;
};

export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calcLineAmounts(line: ProjectFileLineInput) {
  const quantity = toNumber(line.quantity, 0);
  const materialUnitPrice = toNumber(line.materialUnitPrice, 0);
  const laborUnitPrice = toNumber(line.laborUnitPrice, 0);

  const materialAmount = round2(quantity * materialUnitPrice);
  const laborAmount = round2(quantity * laborUnitPrice);

  const lineTotal = round2(materialAmount + laborAmount);

  return {
    quantity: quantity || null,
    materialUnitPrice: materialUnitPrice || null,
    materialAmount: materialAmount || null,
    laborUnitPrice: laborUnitPrice || null,
    laborAmount: laborAmount || null,
    lineTotal: lineTotal || null,
  };
}

export function calcProjectTotals(
  lines: ProjectFileLineInput[],
  overheadPercent: number,
  discount: number
) {
  const subtotal = round2(
    lines.reduce((sum, line) => {
      const amounts = calcLineAmounts(line);
      return sum + (amounts.lineTotal ?? 0);
    }, 0)
  );
  const overheadAmount = round2((subtotal * toNumber(overheadPercent, 0)) / 100);
  const total = round2(subtotal + overheadAmount);
  const grandTotal = round2(total - toNumber(discount, 0));

  return {
    subtotal,
    overheadPercent: round2(toNumber(overheadPercent, 0)),
    overheadAmount,
    total,
    discount: round2(toNumber(discount, 0)),
    grandTotal,
  };
}

export function formatMoney(value: number | null | undefined) {
  const num = toNumber(value, 0);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


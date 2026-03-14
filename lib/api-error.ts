export function formatApiError(error: unknown) {
  const message = String(error);
  const isDev = process.env.NODE_ENV !== "production";

  if (message.includes("P2025")) {
    return {
      status: 404,
      error: "ไม่พบข้อมูลที่ต้องการแก้ไข",
      detail: isDev ? message : undefined,
    };
  }

  if (message.includes("P2002") || message.includes("Unique constraint")) {
    return {
      status: 409,
      error: "ข้อมูลซ้ำกับที่มีอยู่ในระบบ",
      detail: isDev ? message : undefined,
    };
  }

  if (message.includes("Invalid value for argument") || message.includes("Unknown argument")) {
    return {
      status: 400,
      error: "รูปแบบข้อมูลไม่ถูกต้อง",
      detail: isDev ? message : undefined,
    };
  }

  return {
    status: 500,
    error: "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่",
    detail: isDev ? message : undefined,
  };
}


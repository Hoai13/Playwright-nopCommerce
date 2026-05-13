// ===== STRING =====
export const generateRandomString = (length: number) =>
  Array.from({ length }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 36)
    )
  ).join("");

// ===== EMAIL =====
export const randomEmail = (prefix = "user") => {
  const time = Date.now();
  const rand = Math.floor(Math.random() * 10000);

  return `${prefix}_${time}_${rand}@gmail.com`;
};

// ===== DATE =====
export const formatDate = (date: Date) => {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")}/${date.getFullYear()}`;
};

export const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDate(d);
};
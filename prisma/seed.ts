import { PrismaClient } from "@prisma/client";
import { PRODUCTS } from "../src/lib/products";
const prisma = new PrismaClient();
async function main() {
  for (const p of PRODUCTS) await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
  console.log("Productos sembrados:", PRODUCTS.length);
}
main().finally(() => prisma.$disconnect());

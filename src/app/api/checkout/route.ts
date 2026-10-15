import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const { customer, items } = await req.json();
    if (!customer?.email || !customer?.name || !Array.isArray(items) || !items.length)
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

    // Los precios SIEMPRE se leen de la BD, nunca del cliente
    const products = await prisma.product.findMany({ where: { id: { in: items.map((i: any) => i.productId) } } });
    const lines = items.map((i: any) => {
      const p = products.find((x) => x.id === i.productId);
      const q = Number(i.quantity);
      if (!p || !Number.isInteger(q) || q < 1) throw new Error("Producto inválido");
      if (p.stock < q) throw new Error(`Sin stock suficiente de ${p.name}`);
      return { p, q };
    });
    const total = lines.reduce((s: number, l: any) => s + l.p.price * l.q, 0);

    // Buscar o crear usuario (compra como invitado => password aleatoria)
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: { name: customer.name, address: customer.address, city: customer.city },
      create: {
        name: customer.name, email: customer.email, address: customer.address, city: customer.city,
        passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id, total, status: "PENDING",
        items: { create: lines.map((l: any) => ({ productId: l.p.id, quantity: l.q, precioUnitario: l.p.price })) },
      },
    });

    const base = process.env.NEXT_PUBLIC_BASE_URL!;
    const pref = await new Preference(mp).create({
      body: {
        items: lines.map((l: any) => ({ id: l.p.id, title: l.p.name, quantity: l.q, unit_price: l.p.price, currency_id: "COP" })),
        payer: { name: customer.name, email: customer.email },
        external_reference: String(order.id),
        notification_url: `${base}/api/webhooks/payment`,
        back_urls: { success: `${base}/tienda?pago=ok`, failure: `${base}/checkout`, pending: `${base}/tienda?pago=pendiente` },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ orderId: order.id, paymentUrl: pref.init_point });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Error interno" }, { status: 500 });
  }
}

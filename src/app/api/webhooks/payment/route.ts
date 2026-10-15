import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
    if (type !== "payment" || !paymentId) return NextResponse.json({ ok: true });

    // Se consulta el pago directamente a Mercado Pago (no se confía en el body del webhook)
    const payment = await new Payment(mp).get({ id: paymentId });
    const orderId = Number(payment.external_reference);

    if (payment.status === "approved" && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (order && order.status !== "PAID") {
        await prisma.$transaction([
          prisma.order.update({ where: { id: orderId }, data: { status: "PAID", paymentId: String(paymentId) } }),
          ...order.items.map((i) => prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } })),
        ]);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export type ProductData = { id: string; name: string; price: number; image: string; category: string; stock: number };

// Catálogo base (se usa en el frontend y en el seed). "image" es un emoji placeholder: cámbialo por /public/products/xxx.png
export const PRODUCTS: ProductData[] = [
  { id: "tote", name: "Tote Bag", price: 45000, image: "👜", category: "Accesorios", stock: 50 },
  { id: "bitacora", name: "Bitácora", price: 38000, image: "📓", category: "Papelería", stock: 50 },
  { id: "cofre", name: "Cofre", price: 90000, image: "🧰", category: "Coleccionables", stock: 20 },
  { id: "camiseta", name: "Camiseta", price: 65000, image: "👕", category: "Ropa", stock: 80 },
  { id: "vela", name: "Vela", price: 42000, image: "🕯️", category: "Hogar", stock: 40 },
  { id: "cup", name: "Cup", price: 35000, image: "🥤", category: "Hogar", stock: 60 },
  { id: "pin", name: "Pin", price: 15000, image: "📌", category: "Accesorios", stock: 150 },
  { id: "llavero", name: "Llavero", price: 18000, image: "🔑", category: "Accesorios", stock: 120 },
  { id: "peluche", name: "Peluche", price: 55000, image: "🧸", category: "Coleccionables", stock: 30 },
];

export const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

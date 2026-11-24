import { useEffect, useState } from "react";

// En local usa el puerto 3000; en Codespaces cambia el puerto en la URL
const host = window.location.hostname;
// En la nube la URL del backend llega por VITE_API_URL (se define al construir la imagen)
const API =
  import.meta.env.VITE_API_URL ||
  (host.includes("app.github.dev")
    ? `https://${host.replace("-8080.", "-3000.")}`
    : `http://${host}:3000`);

const icono = (nombre) => {
  const n = nombre.toLowerCase();
  if (n.includes("arroz")) return "🍚";
  if (n.includes("aceite")) return "🫒";
  if (n.includes("leche")) return "🥛";
  if (n.includes("pan")) return "🍞";
  return "🛒";
};

export default function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [cliente, setCliente] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch(API + "/productos")
      .then((r) => r.json())
      .then(setProductos)
      .catch(() => setMensaje("No se pudo conectar con la API"));
  }, []);

  const agregar = (p) => {
    setCarrito((c) => {
      const existe = c.find((i) => i.id === p.id);
      if (existe) return c.map((i) => (i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [...c, { ...p, cantidad: 1 }];
    });
    setMensaje("");
    setAbierto(true);
  };

  const cambiar = (id, delta) => {
    setCarrito((c) =>
      c.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
       .filter((i) => i.cantidad > 0)
    );
  };

  const quitar = (id) => setCarrito((c) => c.filter((i) => i.id !== id));

  const total = carrito.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0);
  const cantidadTotal = carrito.reduce((s, i) => s + i.cantidad, 0);

  const comprar = async () => {
    if (!cliente.trim()) {
      setMensaje("Escribe tu nombre para continuar");
      return;
    }
    try {
      for (const i of carrito) {
        const r = await fetch(API + "/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente, producto_id: i.id, cantidad: i.cantidad }),
        });
        if (!r.ok) throw new Error("fallo");
      }
      setCarrito([]);
      setCliente("");
      setMensaje("¡Pedido registrado con éxito!");
    } catch {
      setMensaje("Error al registrar el pedido");
    }
  };

  return (
    <div>
      <header className="header">
        <span className="logo">BODEGA EXPRESS</span>
        <button className="cart-btn" onClick={() => setAbierto(true)}>
          🛒{cantidadTotal > 0 && <span className="badge">{cantidadTotal}</span>}
        </button>
      </header>

      <section className="hero">
        <h2>Tu bodega de barrio, ahora online</h2>
        <p>Elige tus productos y haz tu pedido en un minuto</p>
      </section>

      <main className="container">
        {mensaje && !abierto && <div className="msg">{mensaje}</div>}
        <div className="grid">
          {productos.map((p) => (
            <div className="card" key={p.id}>
              <div className="img">{icono(p.nombre)}</div>
              <h3>{p.nombre}</h3>
              <div className="price">S/ {Number(p.precio).toFixed(2)}</div>
              <button className="btn" onClick={() => agregar(p)}>AGREGAR AL CARRITO</button>
            </div>
          ))}
        </div>
      </main>

      {abierto && (
        <>
          <div className="overlay" onClick={() => setAbierto(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              Carrito de compras
              <button className="close" onClick={() => setAbierto(false)}>✕</button>
            </div>

            <div className="drawer-body">
              {carrito.length === 0 && <p className="empty">Tu carrito está vacío</p>}
              {carrito.map((i) => (
                <div className="item" key={i.id}>
                  <div className="thumb">{icono(i.nombre)}</div>
                  <div className="info">
                    {i.nombre}
                    <div className="qty">
                      <button onClick={() => cambiar(i.id, -1)}>−</button>
                      <span>{i.cantidad}</span>
                      <button onClick={() => cambiar(i.id, 1)}>+</button>
                    </div>
                  </div>
                  <div className="sub">S/ {(Number(i.precio) * i.cantidad).toFixed(2)}</div>
                  <button className="trash" onClick={() => quitar(i.id)}>🗑</button>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <input className="input" placeholder="Tu nombre" value={cliente}
                onChange={(e) => setCliente(e.target.value)} />
              <div className="total-row">
                <span>Total:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
              <button className="btn" disabled={carrito.length === 0} onClick={comprar}>
                INICIAR COMPRA
              </button>
              {mensaje && <div className="msg">{mensaje}</div>}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

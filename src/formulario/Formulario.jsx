import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.js";
import "./Formulario.css";
const Formulario = () => {
  const [stockGramos, setStockGramos] = useState(0);
  const [productoId, setProductoId] = useState(null);
  const [kilosComprados, setKilosComprados] = useState("");
  const [precio, setPrecio] = useState("");
  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [medioPago, setMedioPago] = useState("");
  const [cargando, setCargando] = useState(false);

  const NOMBRE_BD = "comida para gato";
  const NOMBRE_MOSTRAR = "comida para gato";
  const GRAMOS_POR_KILO = 1000;

  // Verificar estructura de la tabla ventas al cargar
  useEffect(() => {
    verificarTablaVentas();
  }, []);

  const verificarTablaVentas = async () => {
    try {
      const { data, error } = await supabase
        .from("ventas")
        .select("*")
        .limit(1);

      if (error) {
        console.error("❌ Error al verificar tabla ventas:", error);
        console.log(
          '⚠️ Posiblemente la tabla "ventas" no existe o no tiene RLS configurado',
        );
      } else {
        console.log(
          "✅ Tabla ventas verificada. Columnas disponibles:",
          data.length > 0 ? Object.keys(data[0]) : "Sin datos",
        );
      }
    } catch (err) {
      console.error("❌ Error al verificar:", err);
    }
  };

  // Cargar el stock del producto
  useEffect(() => {
    cargarStock();

    const canal = supabase
      .channel("productos-comidagato")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => cargarStock(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const cargarStock = async () => {
    console.log("🔍 Buscando producto:", NOMBRE_BD);

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("nombre", NOMBRE_BD);

    if (error) {
      console.error("❌ Error al cargar stock:", error);
      return;
    }

    console.log("📦 Datos encontrados:", data);

    if (data && data.length > 0) {
      setStockGramos(data[0].stock);
      setProductoId(data[0].id);
      console.log(
        "✅ Producto encontrado - ID:",
        data[0].id,
        "Stock (g):",
        data[0].stock,
      );
    } else {
      console.log("❌ No se encontró el producto");
      setStockGramos(0);
      setProductoId(null);
    }
  };

  const esConsumoInterno = medioPago === "consumo interno";

  const handleForm = async (e) => {
    e.preventDefault();

    console.log("🚀 Iniciando proceso de venta");

    const kilosNum = Number(kilosComprados);
    const gramosVendidos = kilosNum * GRAMOS_POR_KILO;
    const precioNum = esConsumoInterno ? 0 : Number(precio);

    // Validaciones
    if (!kilosComprados || kilosNum <= 0) {
      alert("❌ Ingresá una cantidad válida de kilos");
      return;
    }

    if (!medioPago) {
      alert("❌ Seleccioná un medio de pago");
      return;
    }

    if (!esConsumoInterno && (!precio || precioNum <= 0)) {
      alert("❌ Ingresá un precio válido");
      return;
    }

    if (!fecha) {
      alert("❌ Seleccioná una fecha");
      return;
    }

    if (!productoId) {
      alert("❌ Producto no encontrado en la base de datos");
      return;
    }

    if (gramosVendidos > stockGramos) {
      alert(
        `❌ No hay suficiente stock. Disponible: ${(stockGramos / GRAMOS_POR_KILO).toFixed(2)} kg`,
      );
      return;
    }

    setCargando(true);

    const nuevoStockGramos = stockGramos - gramosVendidos;
    console.log(
      `🔄 Actualizando stock de ${stockGramos}g a ${nuevoStockGramos}g`,
    );

    // 1. Actualizar stock (en gramos)
    console.log("📝 Paso 1: Actualizar stock...");
    const { error: errorStock } = await supabase
      .from("productos")
      .update({ stock: nuevoStockGramos })
      .eq("id", productoId);

    if (errorStock) {
      console.error("❌ Error al actualizar stock:", errorStock);
      alert(`Error al actualizar stock: ${errorStock.message}`);
      setCargando(false);
      return;
    }
    console.log("✅ Stock actualizado correctamente");

    // 2. Insertar venta (cantidad en gramos, igual que el stock)
    console.log("📝 Paso 2: Guardar venta...");
    console.log("Datos de la venta:", {
      producto_id: productoId,
      cantidad: gramosVendidos,
      precio: precioNum,
      fecha,
      cliente: cliente || null,
      medio_pago: medioPago || null,
    });

    try {
      const { data: ventaData, error: errorVenta } = await supabase
        .from("ventas")
        .insert({
          producto_id: productoId,
          cantidad: gramosVendidos,
          precio: precioNum,
          fecha,
          cliente: cliente || null,
          medio_pago: medioPago || null,
        })
        .select();

      if (errorVenta) {
        console.error("❌ Error detallado al guardar venta:", errorVenta);
        console.error("Código de error:", errorVenta.code);
        console.error("Mensaje:", errorVenta.message);
        console.error("Detalles:", errorVenta.details);

        if (errorVenta.code === "23502") {
          alert(
            "❌ Error: La tabla ventas tiene una columna que no existe o es requerida",
          );
        } else if (errorVenta.code === "23503") {
          alert(
            "❌ Error: El producto_id no existe en la tabla productos o hay problema de clave foránea",
          );
        } else if (errorVenta.code === "42501") {
          alert(
            "❌ Error: No tenés permisos para insertar en la tabla ventas (RLS)",
          );
        } else {
          alert(`❌ Error al guardar la venta: ${errorVenta.message}`);
        }

        setCargando(false);
        return;
      }

      console.log("✅ Venta guardada correctamente:", ventaData);
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      alert(`Error inesperado: ${err.message}`);
      setCargando(false);
      return;
    }

    // 3. Actualizar el stock localmente
    setStockGramos(nuevoStockGramos);

    // 4. Limpiar campos
    setKilosComprados("");
    setPrecio("");
    setFecha("");
    setCliente("");
    setMedioPago("");

    setCargando(false);
    alert("✅ Venta completada con éxito");
  };

  return (
    <div className="container">
      <h1>🐱 {NOMBRE_MOSTRAR}</h1>

      <div className="stock-display">
        <div className="stock-label">Stock disponible</div>
        <div className="stock-value">
          {(stockGramos / GRAMOS_POR_KILO).toFixed(2)} <span>kg</span>
        </div>
      </div>

      <form onSubmit={handleForm} className="formInput">
        <input
          type="number"
          value={kilosComprados}
          onChange={(e) => setKilosComprados(e.target.value)}
          placeholder="kilos comprados"
          step="0.1"
          min="0"
          required
          disabled={cargando}
        />
        <input
          type="number"
          value={esConsumoInterno ? "" : precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder={esConsumoInterno ? "sin costo (consumo interno)" : "precio"}
          step="0.01"
          min="0"
          required={!esConsumoInterno}
          disabled={cargando || esConsumoInterno}
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          disabled={cargando}
        />
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="cliente (opcional)"
          disabled={cargando}
        />
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          required
          disabled={cargando}
        >
          <option value="" disabled>medio de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="consumo interno">Consumo interno</option>
        </select>
        <button type="submit" disabled={cargando}>
          {cargando ? "Procesando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default Formulario;

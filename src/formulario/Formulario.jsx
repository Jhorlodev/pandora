import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.js";
import "./Formulario.css";
const Formulario = () => {
  const [stock, setStock] = useState(0);
  const [productoId, setProductoId] = useState(null);
  const [kilosComprados, setKilosComprados] = useState("");
  const [precio, setPrecio] = useState("");
  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [medioPago, setMedioPago] = useState("");
  const [cargando, setCargando] = useState(false);

  const NOMBRE_BD = "comidagato";
  const NOMBRE_MOSTRAR = "comida para gato";

  // Verificar estructura de la tabla ventas al cargar
  useEffect(() => {
    verificarTablaVentas();
  }, []);

  const verificarTablaVentas = async () => {
    try {
      // Intentar insertar un registro de prueba para ver la estructura
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
      setStock(data[0].stock);
      setProductoId(data[0].id);
      console.log(
        "✅ Producto encontrado - ID:",
        data[0].id,
        "Stock:",
        data[0].stock,
      );
    } else {
      console.log("❌ No se encontró el producto");
      setStock(0);
      setProductoId(null);
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();

    console.log("🚀 Iniciando proceso de venta");

    const kilosNum = Number(kilosComprados);
    const precioNum = Number(precio);

    // Validaciones
    if (!kilosComprados || kilosNum <= 0) {
      alert("❌ Ingresá una cantidad válida de kilos");
      return;
    }

    if (!precio || precioNum <= 0) {
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

    if (kilosNum > stock) {
      alert(`❌ No hay suficiente stock. Disponible: ${stock} kg`);
      return;
    }

    setCargando(true);

    const nuevoStock = stock - kilosNum;
    console.log(`🔄 Actualizando stock de ${stock} a ${nuevoStock}`);

    // 1. Actualizar stock
    console.log("📝 Paso 1: Actualizar stock...");
    const { error: errorStock } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", productoId);

    if (errorStock) {
      console.error("❌ Error al actualizar stock:", errorStock);
      alert(`Error al actualizar stock: ${errorStock.message}`);
      setCargando(false);
      return;
    }
    console.log("✅ Stock actualizado correctamente");

    // 2. Insertar venta
    console.log("📝 Paso 2: Guardar venta...");
    console.log("Datos de la venta:", {
      producto_id: productoId,
      cantidad: kilosNum,
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
          cantidad: kilosNum,
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

        // Mensajes específicos según el error
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
    setStock(nuevoStock);

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
          {stock} <span>kg</span>
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
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="precio"
          step="0.01"
          min="0"
          required
          disabled={cargando}
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
        <input
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          placeholder="medio de pago (opcional)"
          disabled={cargando}
        />
        <button type="submit" disabled={cargando}>
          {cargando ? "Procesando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default Formulario;

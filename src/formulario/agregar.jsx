import React, { useState } from "react";
import { supabase } from "../supabase/supabase.js";
import "./arena.css";

const FormularioAgregarProducto = () => {
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [costo, setCosto] = useState("");
  const [ganancia, setGanancia] = useState("");
  const [cargando, setCargando] = useState(false);

  const costoNum = Number(costo) || 0;
  const gananciaNum = Number(ganancia) || 0;
  const precioCalculado = costoNum + gananciaNum;

  const handleForm = async (e) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim().toLowerCase();
    const stockNum = Number(stock);

    if (!nombreLimpio) {
      alert("❌ Ingresá el nombre del producto");
      return;
    }

    if (!stock || stockNum < 0) {
      alert("❌ Ingresá un stock inicial válido");
      return;
    }

    if (!costo || costoNum <= 0) {
      alert("❌ Ingresá el costo del producto");
      return;
    }

    if (!ganancia || gananciaNum < 0) {
      alert("❌ Ingresá la ganancia esperada");
      return;
    }

    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("productos")
        .insert({
          nombre: nombreLimpio,
          stock: stockNum,
          costo: costoNum,
          ganancia: gananciaNum,
          precio: precioCalculado,
        })
        .select();

      if (error) {
        console.error("❌ Error al agregar producto:", error);

        if (error.code === "23505") {
          alert(`❌ Ya existe un producto llamado "${nombreLimpio}"`);
        } else if (error.code === "42501") {
          alert("❌ No tenés permisos para agregar productos (RLS)");
        } else {
          alert(`❌ Error al agregar el producto: ${error.message}`);
        }

        setCargando(false);
        return;
      }

      console.log("✅ Producto agregado:", data);
      alert(`✅ "${nombreLimpio}" agregado con éxito`);

      setNombre("");
      setStock("");
      setCosto("");
      setGanancia("");
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      alert(`Error inesperado: ${err.message}`);
    }

    setCargando(false);
  };

  return (
    <div className="container">
      <h1>🐾 Agregar producto</h1>

      <form onSubmit={handleForm} className="formInput">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="nombre del producto"
          required
          disabled={cargando}
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="stock inicial"
          step="0.1"
          min="0"
          required
          disabled={cargando}
        />
        <input
          type="number"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          placeholder="costo"
          step="0.01"
          min="0"
          required
          disabled={cargando}
        />
        <input
          type="number"
          value={ganancia}
          onChange={(e) => setGanancia(e.target.value)}
          placeholder="ganancia esperada"
          step="0.01"
          min="0"
          required
          disabled={cargando}
        />

        <div className="stock-display">
          <div className="stock-label">Precio de venta (costo + ganancia)</div>
          <div className="stock-value">{precioCalculado}</div>
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Agregar producto"}
        </button>
      </form>
    </div>
  );
};

export default FormularioAgregarProducto;

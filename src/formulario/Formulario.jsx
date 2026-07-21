import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase/supabase.js'
import './Formulario.css'

const Formulario = () => {
  const { producto } = useParams()
  const [stockList, setStockList] = useState([])
  const [kilosComprados, setKilosComprados] = useState('')
  const [precio, setPrecio] = useState('')
  const [fecha, setFecha] = useState('')
  const [cliente, setCliente] = useState('')
  const [medioPago, setMedioPago] = useState('')
  
  
  const [data, setData] = useState([])

  useEffect(() => {
    async function getData() {
      const { data: data } = await supabase.from('productos').select('*')

      if (data) {
         setData(data)
      }
    }

    getData()
  }, [])
  
  
  

  useEffect(() => {
    cargarStock()

    const canal = supabase
      .channel(`productos-realtime-${producto}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        () => cargarStock()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [producto])

  const cargarStock = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('nombre', producto)

    if (error) {
      console.error('Error al cargar stock:', error)
      return
    }
    setStockList(data)
  }

  const handleForm = async (e) => {
    e.preventDefault()

    const kilosNum = Number(kilosComprados)
    const precioNum = Number(precio)
    if (kilosNum <= 0 || precioNum <= 0 || !fecha) return

    const item = stockList[0]
    if (!item) return

    if (kilosNum > item.stock) {
      alert('No hay suficiente stock')
      return
    }

    const { error: errorStock } = await supabase
      .from('productos')
      .update({ stock: item.stock - kilosNum })
      .eq('id', item.id)

    if (errorStock) {
      console.error('Error al actualizar stock:', errorStock)
      return
    }

    const { error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        producto_id: item.id,
        cantidad: kilosNum,
        precio: precioNum,
        fecha,
        cliente,
        medio_pago: medioPago,
      })

    if (errorVenta) {
      console.error('Error al guardar venta:', errorVenta)
      return
    }

    setKilosComprados('')
    setPrecio('')
    setFecha('')
    setCliente('')
    setMedioPago('')
  }

  return (
    <div className='container'>
      <h1>{producto}</h1>
      
      <ul>
      {data.map((data) => (
        <div key={data.id}>{data.nombre} {data.stock}</div>
      ))}
    </ul>

      {stockList.map((p) => (
        <p key={p.id}>Stock disponible: {p.stock} kg</p>
      ))}

      <form onSubmit={handleForm} className='formInput'>
        <input
          value={kilosComprados}
          onChange={(e) => setKilosComprados(e.target.value)}
          placeholder='kilos comprados'
        />
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder='precio'
        />
        <input
          type='date'
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder='cliente'
        />
        <input
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          placeholder='medio de pago'
        />
        <button type='submit'>enviar</button>
      </form>
    </div>
  )
}

export default Formulario
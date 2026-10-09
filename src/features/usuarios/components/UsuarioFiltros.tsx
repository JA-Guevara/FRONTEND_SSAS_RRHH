import type { FormEvent } from 'react'
import { Button, Field } from '../../../shared/components'

export type UsuarioFiltrosProps = {
  search: string
  onSearchChange: (value: string) => void
  estadoFiltro: string
  onEstadoFiltroChange: (value: string) => void
  incluirEliminados: boolean
  onIncluirEliminadosChange: (value: boolean) => void
  onSubmit: (e: FormEvent) => void
}

export function UsuarioFiltros({
  search,
  onSearchChange,
  estadoFiltro,
  onEstadoFiltroChange,
  incluirEliminados,
  onIncluirEliminadosChange,
  onSubmit,
}: UsuarioFiltrosProps) {
  return (
    <form className="filters" onSubmit={onSubmit}>
      <Field label="Buscar">
        <input
          value={search}
          onChange={(evento) => onSearchChange(evento.target.value)}
          placeholder="Nombre, usuario o correo"
        />
      </Field>
      <Field label="Estado">
        <select
          value={estadoFiltro}
          onChange={(evento) => onEstadoFiltroChange(evento.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
      </Field>
      <label className="check-label">
        <input
          type="checkbox"
          checked={incluirEliminados}
          onChange={(evento) => onIncluirEliminadosChange(evento.target.checked)}
        />
        Incluir eliminados
      </label>
      <div className="filters-actions">
        <Button type="submit" variant="secondary">
          Consultar
        </Button>
      </div>
    </form>
  )
}

import './asistente-avatar.css'

export type AsistenteAvatarEstado = 'reposo' | 'escuchando' | 'pensando' | 'listo' | 'alerta'

export type AsistenteAvatarProps = {
  estado: AsistenteAvatarEstado
  tamano?: number
}

export function AsistenteAvatar({ estado, tamano = 28 }: AsistenteAvatarProps) {
  return (
    <svg
      className={`asistente-avatar asistente-avatar--${estado}`}
      viewBox="0 0 32 32"
      width={tamano}
      height={tamano}
      aria-hidden="true"
      focusable="false"
    >
      <g className="av-ondas">
        <circle className="av-onda av-onda-1" cx="16" cy="18.5" r="11.5" />
        <circle className="av-onda av-onda-2" cx="16" cy="18.5" r="15" />
        <circle className="av-onda av-onda-3" cx="16" cy="18.5" r="18.5" />
      </g>

      <g className="av-puntos">
        <circle className="av-punto av-punto-1" cx="9.5" cy="6.5" r="1.8" />
        <circle className="av-punto av-punto-2" cx="16" cy="6.5" r="1.8" />
        <circle className="av-punto av-punto-3" cx="22.5" cy="6.5" r="1.8" />
      </g>

      <rect className="av-cabeza" x="6" y="11" width="20" height="15" rx="6" />
      <ellipse className="av-ojo" cx="12.4" cy="18" rx="1.9" ry="2.6" />
      <ellipse className="av-ojo" cx="19.6" cy="18" rx="1.9" ry="2.6" />
      <rect className="av-destello" x="7.5" y="12.5" width="17" height="12" rx="5" />

      <path className="av-antena" d="M16 11 V7.6" />
      <circle className="av-antena-punto" cx="16" cy="5.8" r="1.7" />
      <circle className="av-alerta" cx="27" cy="5.5" r="3.4" />
    </svg>
  )
}

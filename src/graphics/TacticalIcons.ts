/**
 * High-Definition Tactical Badges & Vector Icon Library
 * Replaces all emojis with razor-sharp, military-grade SVG icons and holographic emblems.
 */

export class TacticalIcons {
  /**
   * Returns an inline SVG string for an upgrade chip by ID
   */
  public static getChipIcon(chipId: string, size: number = 48): string {
    switch (chipId) {
      // 1. High Velocity APFSDS
      case 'high_velocity':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hv-grad" x1="0" y1="64" x2="64" y2="0">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="50%" stop-color="#f8fafc"/>
                <stop offset="100%" stop-color="#facc15"/>
              </linearGradient>
              <filter id="hv-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Speed streaks -->
            <path d="M8 44L24 40M6 32L20 30M10 20L22 22" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <!-- Long Dart Penetrator -->
            <path d="M18 46L44 20L52 12L50 20L26 46L20 48L18 46Z" fill="url(#hv-grad)" filter="url(#hv-glow)"/>
            <!-- Stabilizer Fins -->
            <path d="M22 42L16 48L24 46Z" fill="#0284c7"/>
            <path d="M26 38L22 44L28 42Z" fill="#0284c7"/>
          </svg>
        `;

      // 2. Reinforced Plating
      case 'reinforced_armor':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
            <!-- Ballistic Shield -->
            <path d="M32 10L50 18V32C50 44 42 52 32 56C22 52 14 44 14 32V18L32 10Z" fill="#14532d" stroke="#4ade80" stroke-width="2.5"/>
            <!-- Cross Armor Plate -->
            <path d="M32 14L46 20V32C46 41 39 48 32 52C25 48 18 41 18 32V20L32 14Z" fill="#166534"/>
            <!-- Rivet bolts -->
            <circle cx="22" cy="24" r="2" fill="#86efac"/>
            <circle cx="42" cy="24" r="2" fill="#86efac"/>
            <circle cx="32" cy="34" r="3.5" fill="#4ade80"/>
            <circle cx="32" cy="46" r="2" fill="#86efac"/>
          </svg>
        `;

      // 3. Auto-Loading Mechanism
      case 'rapid_loader':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#facc15" stroke-width="2"/>
            <!-- Revolver Shell Magazine -->
            <circle cx="32" cy="32" r="18" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
            <!-- Shell Chambers -->
            <circle cx="32" cy="18" r="4" fill="#facc15" stroke="#ca8a04"/>
            <circle cx="44" cy="25" r="4" fill="#facc15" stroke="#ca8a04"/>
            <circle cx="44" cy="39" r="4" fill="#facc15" stroke="#ca8a04"/>
            <circle cx="32" cy="46" r="4" fill="#facc15" stroke="#ca8a04"/>
            <circle cx="20" cy="39" r="4" fill="#facc15" stroke="#ca8a04"/>
            <circle cx="20" cy="25" r="4" fill="#facc15" stroke="#ca8a04"/>
            <!-- Rapid arrows -->
            <path d="M26 12L32 8L38 12" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

      // 4. Turbocharger Engine
      case 'turbo_engine':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Turbine Blades -->
            <circle cx="32" cy="32" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <path d="M32 16C36 22 42 26 48 32C42 38 36 42 32 48C28 42 22 38 16 32C22 26 28 22 32 16Z" fill="#0284c7"/>
            <circle cx="32" cy="32" r="6" fill="#f8fafc"/>
            <!-- Boost flames -->
            <path d="M12 48L18 42M52 48L46 42" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>
          </svg>
        `;

      // 5. Scrap Collector
      case 'scrap_collector':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#eab308" stroke-width="2"/>
            <!-- Horseshoe Magnet -->
            <path d="M20 18V30C20 36.6 25.4 42 32 42C38.6 42 44 36.6 44 30V18H36V30C36 32.2 34.2 34 32 34C29.8 34 28 32.2 28 30V18H20Z" fill="#ef4444"/>
            <rect x="20" y="14" width="8" height="6" fill="#f8fafc"/>
            <rect x="36" y="14" width="8" height="6" fill="#f8fafc"/>
            <!-- Attracted Cog -->
            <circle cx="32" cy="50" r="5" fill="#facc15"/>
          </svg>
        `;

      // 6. Nanite Repair Swarm
      case 'nanite_repair':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
            <!-- Hexagonal Core -->
            <polygon points="32,14 48,23 48,41 32,50 16,41 16,23" fill="#14532d" stroke="#4ade80" stroke-width="2"/>
            <!-- Medical Cross -->
            <rect x="29" y="22" width="6" height="20" fill="#86efac" rx="2"/>
            <rect x="22" y="29" width="20" height="6" fill="#86efac" rx="2"/>
            <!-- Nano spark dots -->
            <circle cx="20" cy="18" r="2" fill="#22c55e"/>
            <circle cx="44" cy="18" r="2" fill="#22c55e"/>
          </svg>
        `;

      // 7. Kinetic Bouncing Shells
      case 'bouncing_rounds':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Angled Wall Plate -->
            <line x1="42" y1="12" x2="42" y2="52" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
            <!-- Zigzag ricochet trail -->
            <path d="M12 40L40 24L16 16" stroke="#facc15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Impact Sparks -->
            <circle cx="40" cy="24" r="5" fill="#f97316"/>
            <circle cx="40" cy="24" r="2.5" fill="#fef08a"/>
          </svg>
        `;

      // 8. Twin-Linked Cannons
      case 'dual_barrel':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Left Barrel -->
            <rect x="22" y="14" width="7" height="34" fill="#64748b" stroke="#334155" stroke-width="1.5" rx="1"/>
            <rect x="20" y="10" width="11" height="6" fill="#1e293b" rx="1"/>
            <!-- Right Barrel -->
            <rect x="35" y="14" width="7" height="34" fill="#64748b" stroke="#334155" stroke-width="1.5" rx="1"/>
            <rect x="33" y="10" width="11" height="6" fill="#1e293b" rx="1"/>
            <!-- Turret Base Mount -->
            <rect x="18" y="44" width="28" height="10" fill="#0f172a" stroke="#38bdf8" stroke-width="2" rx="3"/>
          </svg>
        `;

      // 9. Heavy Ramming Prow
      case 'ramming_prow':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#f97316" stroke-width="2"/>
            <!-- Heavy Ram Blade -->
            <path d="M12 28L32 16L52 28L46 44L32 40L18 44L12 28Z" fill="#334155" stroke="#e2e8f0" stroke-width="2"/>
            <!-- Hazard Stripes on Ram -->
            <path d="M22 28L28 24M32 28L38 24M42 28L48 24" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
            <polygon points="32,16 36,26 28,26" fill="#facc15"/>
          </svg>
        `;

      // 10. Thermite Incendiary Rounds
      case 'incendiary_rounds':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#ea580c" stroke-width="2"/>
            <!-- Flaming Napalm Drop -->
            <path d="M32 12C32 12 48 30 48 40C48 48.8 40.8 56 32 56C23.2 56 16 48.8 16 40C16 30 32 12 32 12Z" fill="#ea580c"/>
            <path d="M32 24C32 24 42 36 42 42C42 47.5 37.5 52 32 52C26.5 52 22 47.5 22 42C22 36 32 24 32 24Z" fill="#f97316"/>
            <circle cx="32" cy="44" r="5" fill="#fde047"/>
          </svg>
        `;

      // 11. Cryo-Frost Ordnance
      case 'cryo_shells':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#06b6d4" stroke-width="2"/>
            <!-- Frost Snowflake / Crystal -->
            <path d="M32 12V52M12 32H52M18 18L46 46M18 46L46 18" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="32" cy="32" r="6" fill="#bae6fd"/>
            <polygon points="32,22 36,26 32,30 28,26" fill="#e0f2fe"/>
          </svg>
        `;

      // 12. Eagle Bastion Gatling
      case 'eagle_point_defense':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Point Defense Turret Dome -->
            <circle cx="32" cy="36" r="14" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
            <!-- Rotary 3 Barrels -->
            <rect x="28" y="10" width="3" height="18" fill="#e2e8f0"/>
            <rect x="33" y="10" width="3" height="18" fill="#e2e8f0"/>
            <rect x="30.5" y="8" width="3" height="18" fill="#f8fafc"/>
            <!-- Eagle Radar dish -->
            <circle cx="32" cy="36" r="4" fill="#38bdf8"/>
          </svg>
        `;

      // 13. Eagle Nano-Shield Matrix
      case 'eagle_nano_shield':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
            <!-- Hexagonal Forcefield Dome -->
            <polygon points="32,10 50,20 50,44 32,54 14,44 14,20" fill="rgba(2, 132, 199, 0.25)" stroke="#38bdf8" stroke-width="2.5"/>
            <!-- Golden Eagle Emblem in Shield -->
            <path d="M32 20L40 32L32 30L24 32L32 20Z" fill="#fbbf24"/>
            <circle cx="32" cy="36" r="4" fill="#67e8f9"/>
          </svg>
        `;

      // 14. High-Energy Railgun Beam
      case 'railgun_laser':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#c084fc" stroke-width="2"/>
            <!-- Parallel Accelerator Rails -->
            <line x1="20" y1="12" x2="20" y2="52" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
            <line x1="44" y1="12" x2="44" y2="52" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
            <!-- Plasma Core Beam -->
            <line x1="32" y1="8" x2="32" y2="56" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
            <line x1="32" y1="8" x2="32" y2="56" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
            <!-- Magnetic Coils -->
            <rect x="18" y="22" width="28" height="3" fill="#e9d5ff" rx="1"/>
            <rect x="18" y="38" width="28" height="3" fill="#e9d5ff" rx="1"/>
          </svg>
        `;

      // 15. Tesla Arc Chain
      case 'tesla_overload':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Lightning Bolt -->
            <polygon points="34,10 18,34 30,34 26,54 46,28 32,28" fill="#fde047" stroke="#38bdf8" stroke-width="1.5"/>
          </svg>
        `;

      // 16. Siege Mortar Trajectory
      case 'mortar_siege':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#f97316" stroke-width="2"/>
            <!-- High Arc Parabolic Line -->
            <path d="M14 48Q32 10 50 48" stroke="#f97316" stroke-width="2.5" stroke-dasharray="4 3"/>
            <!-- Heavy Shell at Apex -->
            <circle cx="32" cy="18" r="6" fill="#ef4444" stroke="#facc15" stroke-width="1.5"/>
            <!-- Impact Target -->
            <circle cx="50" cy="48" r="5" stroke="#ef4444" stroke-width="2"/>
            <circle cx="50" cy="48" r="2" fill="#ef4444"/>
          </svg>
        `;

      // 17. Hovercraft Amphibious Chassis
      case 'hover_chassis':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
            <!-- Air Cushion Base -->
            <ellipse cx="32" cy="36" rx="20" ry="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <!-- Twin Propulsion Fans -->
            <circle cx="24" cy="24" r="6" fill="#0284c7" stroke="#93c5fd"/>
            <circle cx="40" cy="24" r="6" fill="#0284c7" stroke="#93c5fd"/>
            <!-- Water Spray Waves -->
            <path d="M12 46C18 44 26 48 32 46C38 44 46 48 52 46" stroke="#67e8f9" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        `;

      // 18. Battlefield Scavenger Core
      case 'vampiric_scavenger':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
            <!-- Crimson Energy Siphon Core -->
            <circle cx="32" cy="32" r="14" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
            <circle cx="32" cy="32" r="7" fill="#f87171"/>
            <!-- Inward Siphon Arrows -->
            <path d="M32 10L32 16M32 54L32 48M10 32L16 32M54 32L48 32" stroke="#fca5a5" stroke-width="3" stroke-linecap="round"/>
          </svg>
        `;

      // 19. Depleted Uranium Core (Steel Breaker)
      case 'steel_breaker':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#facc15" stroke-width="2.5"/>
            <!-- Shattered Steel Block -->
            <rect x="22" y="16" width="20" height="32" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
            <!-- Penetrating Gold Spike -->
            <polygon points="12,32 32,22 52,32 32,42" fill="#facc15" stroke="#eab308" stroke-width="2"/>
            <line x1="8" y1="32" x2="56" y2="32" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
          </svg>
        `;

      // 20. Tactical Overdrive Afterburner
      case 'overdrive_thruster':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#facc15" stroke-width="2.5"/>
            <!-- Rocket Nozzle -->
            <path d="M24 16H40L44 34H20L24 16Z" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
            <!-- Dual Jet Exhaust Flames -->
            <path d="M24 34L20 54L32 44L44 54L40 34Z" fill="#ea580c"/>
            <path d="M28 34L26 48L32 40L38 48L36 34Z" fill="#fde047"/>
            <line x1="32" y1="12" x2="32" y2="28" stroke="#38bdf8" stroke-width="3"/>
          </svg>
        `;

      default:
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
            <circle cx="32" cy="32" r="10" fill="#475569"/>
          </svg>
        `;
    }
  }

  /**
   * Returns an inline SVG string for Campaign Map Nodes
   */
  public static getMapNodeIcon(type: string, size: number = 36): string {
    switch (type) {
      case 'battle':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Tactical Radar Crosshair -->
            <circle cx="24" cy="24" r="20" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="24" cy="24" r="10" stroke="#38bdf8" stroke-width="1.5"/>
            <circle cx="24" cy="24" r="3" fill="#ef4444"/>
            <line x1="24" y1="4" x2="24" y2="44" stroke="#38bdf8" stroke-width="1.5"/>
            <line x1="4" y1="24" x2="44" y2="24" stroke="#38bdf8" stroke-width="1.5"/>
          </svg>
        `;

      case 'elite':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Officer Skull Badge -->
            <path d="M14 20C14 14 18 10 24 10C30 10 34 14 34 20C34 26 31 30 28 32V38H20V32C17 30 14 26 14 20Z" fill="#b91c1c" stroke="#fca5a5" stroke-width="2"/>
            <circle cx="20" cy="22" r="3" fill="#0f172a"/>
            <circle cx="28" cy="22" r="3" fill="#0f172a"/>
            <!-- Crossbones / Double Chevrons -->
            <path d="M12 40L24 34L36 40" stroke="#facc15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

      case 'shop':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Military Armory Crate -->
            <rect x="8" y="14" width="32" height="26" fill="#334155" stroke="#facc15" stroke-width="2" rx="3"/>
            <line x1="8" y1="26" x2="40" y2="26" stroke="#64748b" stroke-width="2"/>
            <circle cx="24" cy="26" r="4" fill="#facc15"/>
            <path d="M18 14V10C18 8.9 18.9 8 20 8H28C29.1 8 30 8.9 30 10V14" stroke="#facc15" stroke-width="2"/>
          </svg>
        `;

      case 'event':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Encrypted Signal Beacon -->
            <circle cx="24" cy="24" r="18" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
            <text x="24" y="32" font-size="24" font-weight="900" text-anchor="middle" fill="#c7d2fe" font-family="monospace">?</text>
          </svg>
        `;

      case 'rest':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Engineering Wrench & Depot -->
            <circle cx="24" cy="24" r="18" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
            <path d="M18 30L28 20M30 18C31 15 30 13 28 12C26 11 23 12 22 14L26 18L24 20L20 16C18 17 17 20 18 22C19 24 21 25 24 24L30 30C31 31 33 31 34 30C35 29 35 27 34 26L30 22Z" fill="#6ee7b7"/>
          </svg>
        `;

      case 'boss':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Heavy Fortress Crown / Hazard -->
            <polygon points="24,6 44,40 4,40" fill="#450a0a" stroke="#ef4444" stroke-width="2.5"/>
            <!-- Crown battlements inside -->
            <path d="M16 34L20 24L24 30L28 24L32 34Z" fill="#facc15"/>
            <circle cx="24" cy="34" r="3" fill="#ef4444"/>
          </svg>
        `;

      default:
        return `<circle cx="24" cy="24" r="18" fill="#1e293b"/>`;
    }
  }

  /**
   * Returns Eagle Emblem SVG
   */
  public static getEagleLogo(size: number = 32): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L32 16L44 22L36 34L24 44L12 34L4 22L16 16L24 4Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
        <circle cx="24" cy="22" r="5" fill="#38bdf8"/>
      </svg>
    `;
  }
}

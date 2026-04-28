"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Platform, PLATFORMS, PLATFORM_LIST } from "@/lib/platforms"

interface PlatformSelectorProps {
  selected: Platform
  onChange: (platform: Platform) => void
  className?: string
}

// Instagram SVG Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

// Kawaii SVG Icon (stylized K with play button style)
const KawaiiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4v16l14-8L6 4z"/>
  </svg>
)

// TikTok SVG Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Facebook SVG Icon
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.018 4.388 11.007 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.236 2.686.236v2.963h-1.514c-1.492 0-1.956.93-1.956 1.887v2.26h3.328l-.532 3.49h-2.796V24C19.612 23.08 24 18.091 24 12.073z"/>
  </svg>
)

// X (Twitter) SVG Icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.033 9.176 9.45 12.518H16.6l-5.793-7.57-6.63 7.57H.5l8.59-9.812L0 1.153h7.586l5.243 6.932 6.072-6.932zm-1.29 19.494h2.04L6.478 3.24H4.29l13.32 17.407z"/>
  </svg>
)

// Threads SVG Icon
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 192 192" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.347-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 6.981 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96c.223 28.685 6.88 51.515 19.788 67.92 14.504 18.437 36.094 27.884 64.172 28.08h.113c24.986-.171 42.127-11.619 54.167-23.565 18.337-18.324 17.756-41.146 11.733-55.208-4.24-9.886-12.208-17.98-21.437-23.239Zm-30.96 43.348c-5.461 6.148-13.501 9.37-23.882 9.579-10.735.207-19.763-3.519-23.613-9.581-2.332-3.69-3.363-8.025-2.908-12.382.803-7.742 6.574-13.254 16.186-15.499 3.928-.924 8.202-1.38 12.744-1.363 3.928.014 7.664.326 11.158.92 1.085.188 2.137.398 3.155.628-.916 13.004-4.789 21.597-12.84 27.698Z"/>
  </svg>
)

const PlatformIcon = ({ platform, className }: { platform: Platform; className?: string }) => {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon className={className} />
    case 'kawaii':
      return <KawaiiIcon className={className} />
    case 'tiktok':
      return <TikTokIcon className={className} />
    case 'facebook':
      return <FacebookIcon className={className} />
    case 'x':
      return <XIcon className={className} />
    case 'threads':
      return <ThreadsIcon className={className} />
    default:
      return null
  }
}

// Animação de pulso para TikTok
const neonPulseAnimation = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function PlatformSelector({ selected, onChange, className }: PlatformSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-4 justify-center", className)}>
      {PLATFORM_LIST.map((platformId) => {
        const platform = PLATFORMS[platformId]
        const isSelected = selected === platformId
        
        // Estilos específicos para cada plataforma
        const getPlatformStyles = () => {
          if (!isSelected) {
            return "bg-gray-200/80 text-gray-500 hover:bg-gray-300/90 opacity-85"
          }

          // X tem fundo preto quando selecionado
          if (platformId === 'x') {
            return "bg-black text-white"
          }

          switch (platformId) {
            case 'instagram':
              return "bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white"
            case 'kawaii':
              return "bg-[#FF6B00] text-white"
            case 'tiktok':
              return "bg-black text-white"
            case 'threads':
              return "bg-black text-white"
            case 'facebook':
              return "bg-[#1877F2] text-white"
            default:
              return platform.bgColor
          }
        }

        // Shadow styles específicos
        const getShadowStyles = () => {
          if (!isSelected) return ""

          switch (platformId) {
            case 'instagram':
              return "shadow-[0_8px_32px_rgba(225,48,108,0.4)]"
            case 'kawaii':
              return "shadow-[0_8px_32px_rgba(255,107,0,0.4)]"
            case 'tiktok':
              return "shadow-[0_8px_32px_rgba(0,242,234,0.3)]"
            case 'threads':
              return "shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            case 'x':
              return "shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            case 'facebook':
              return "shadow-[0_8px_32px_rgba(24,119,242,0.4)]"
            default:
              return "shadow-lg"
          }
        }
        
        return (
          <motion.button
            key={platformId}
            onClick={() => onChange(platformId)}
            className={cn(
              "relative flex items-center gap-3 px-7 py-4 rounded-2xl font-bold transition-all duration-300 min-w-[160px] justify-center overflow-hidden",
              getPlatformStyles(),
              getShadowStyles(),
              isSelected && "scale-[1.03]"
            )}
            whileHover={{ 
              scale: isSelected ? 1.05 : 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={false}
            animate={isSelected ? { scale: 1.03 } : { scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Instagram glow effect */}
            {platformId === 'instagram' && isSelected && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(131,58,180,0.3), rgba(225,48,108,0.3), rgba(247,119,55,0.3))",
                  filter: "blur(8px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            {/* Kawaii glow border */}
            {platformId === 'kawaii' && isSelected && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-orange-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            {/* X glow effect */}
            {platformId === 'x' && isSelected && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Threads glow effect */}
            {platformId === 'threads' && isSelected && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* TikTok neon border effect */}
            {platformId === 'tiktok' && isSelected && (
              <>
                {/* Cyan neon glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "inset 2px 0 8px rgba(0,242,234,0.6), -2px 0 12px rgba(0,242,234,0.4)",
                  }}
                  variants={neonPulseAnimation}
                  initial="initial"
                  animate="animate"
                />
                {/* Magenta neon glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "inset -2px 0 8px rgba(255,0,80,0.6), 2px 0 12px rgba(255,0,80,0.4)",
                  }}
                  variants={neonPulseAnimation}
                  initial="initial"
                  animate="animate"
                />
                {/* Neon border lines */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00F2EA] via-transparent to-[#FF0050] opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF0050] via-transparent to-[#00F2EA] opacity-80" />
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-[#00F2EA] via-transparent to-[#FF0050] opacity-80" />
                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-[#FF0050] via-transparent to-[#00F2EA] opacity-80" />
              </>
            )}
            
            {/* Icon container */}
            <div className="relative z-10">
              <PlatformIcon 
                platform={platformId} 
                className={cn(
                  "w-6 h-6 transition-all duration-200",
                  isSelected ? "text-white drop-shadow-lg" : "text-gray-500"
                )} 
              />
            </div>
            
            {/* Platform name (hidden for 'x' to avoid duplicate X icon + X text) */}
            {platformId !== 'x' && (
              <span className={cn(
                "relative z-10 text-base tracking-wide transition-all duration-200",
                isSelected ? "text-white drop-shadow-md" : "text-gray-500"
              )}>
                {platform.name}
              </span>
            )}
            
            {/* Active indicator dot */}
            {isSelected && (
              <motion.div
                layoutId="platform-active-indicator"
                className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg",
                  platformId === 'instagram' && "bg-white",
                  platformId === 'kawaii' && "bg-white",
                  platformId === 'tiktok' && "bg-gradient-to-r from-[#00F2EA] to-[#FF0050]",
                  platformId === 'threads' && "bg-white",
                  platformId === 'x' && "bg-white"
                )}
                initial={false}
                transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// Compact version for mobile/smaller spaces
export function PlatformSelectorCompact({ selected, onChange, className }: PlatformSelectorProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {PLATFORM_LIST.map((platformId) => {
        const platform = PLATFORMS[platformId]
        const isSelected = selected === platformId
        
        const getCompactStyles = () => {
          if (!isSelected) {
            return "bg-gray-200/80 text-gray-500 hover:bg-gray-300 opacity-85"
          }

          if (platformId === 'x') {
            return "bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/20"
          }

          switch (platformId) {
            case 'instagram':
              return "bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-[0_4px_16px_rgba(225,48,108,0.35)]"
            case 'kawaii':
              return "bg-[#FF6B00] text-white shadow-[0_4px_16px_rgba(255,107,0,0.35)]"
            case 'tiktok':
              return "bg-black text-white shadow-[0_4px_16px_rgba(0,242,234,0.25)] border border-[#00F2EA]/30"
            case 'threads':
              return "bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-white/10"
            default:
              return cn(platform.bgColor, "text-white shadow-md")
          }
        }
        
        return (
          <motion.button
            key={platformId}
            onClick={() => onChange(platformId)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 overflow-hidden",
              getCompactStyles(),
              isSelected && "scale-[1.02]"
            )}
            whileHover={{ scale: isSelected ? 1.03 : 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* TikTok compact neon effect */}
            {platformId === 'tiktok' && isSelected && (
              <>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00F2EA] to-[#FF0050] opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#FF0050] to-[#00F2EA] opacity-70" />
              </>
            )}
            
            <PlatformIcon 
              platform={platformId} 
              className={cn(
                "w-5 h-5 relative z-10",
                isSelected ? "text-white" : "text-gray-500"
              )} 
            />
            {/* Platform name (hidden for 'x' to avoid duplicate X icon + X text) */}
            {platformId !== 'x' && (
              <span className={cn(
                "text-sm hidden sm:inline relative z-10",
                isSelected ? "text-white" : "text-gray-500"
              )}>
                {platform.name}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

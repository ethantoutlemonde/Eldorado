import { useEffect, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

const extensions = ["png", "jpg", "jpeg", "pdf"] as const
type Extension = typeof extensions[number]

function UserIdCard({ userId }: { userId: string }) {
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const ext = extensions[currentExtensionIndex]
    if (!ext) {
      setLoading(false)
      setError(true)
      return
    }

    if (ext === "pdf") {
      setFileType("pdf")
    } else {
      setFileType("image")
    }
    setLoading(false)
  }, [currentExtensionIndex])

  const handleError = () => {
    if (currentExtensionIndex < extensions.length - 1) {
      setCurrentExtensionIndex(prev => prev + 1)
      setLoading(true)
    } else {
      setError(true)
    }
  }

  const openFullscreen = () => {
    console.log(fileUrl)
  if (fileType === "pdf") {
    const newWindow = window.open(fileUrl, "_blank")
    if (!newWindow) alert("Le navigateur a bloqué l'ouverture de la nouvelle fenêtre.")
    } else {
      setIsFullscreen(true)
    }
  }


  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen()
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  if (loading) return <p className="text-gray-500">{`Chargement du fichier d'identité… ${userId}`}</p>
  if (error) return null

  const currentExt = extensions[currentExtensionIndex]
  const fileUrl = `http://127.0.0.1:8000/idCards/${userId}.${currentExt}`

  return (
    <>
      {fileType === "image" ? (
        <img 
          src={fileUrl} 
          alt="Carte d'identité" 
          className="w-64 border rounded cursor-pointer hover:opacity-80 transition-opacity"
          onError={handleError}
          onClick={openFullscreen}
        />
      ) : (
        <div className="relative w-16 h-16">
  <iframe
    src={fileUrl}
    title="Carte d'identité PDF"
    className="w-full h-full border rounded pointer-events-none" // on empêche les interactions directes
    onError={handleError}
  />
  <div
    onClick={openFullscreen}
    className="absolute inset-0 cursor-pointer z-10"
    title="Ouvrir en grand"
  />
</div>

      )}

      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            {fileType === "image" ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
              >
                <TransformComponent>
                  <img 
                    src={fileUrl} 
                    alt="Carte d'identité" 
                    className="max-w-full max-h-screen object-contain"
                  />
                </TransformComponent>
              </TransformWrapper>
            ) : (
              <iframe 
                src={fileUrl} 
                title="Carte d'identité PDF" 
                className="w-screen h-screen"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default UserIdCard

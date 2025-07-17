"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Wallet, Shield, Zap, Copy, ExternalLink } from "lucide-react"
import { before } from "node:test"


interface WalletConnectProps {
  onBack: () => void
  onNavigate: (view: "swap") => void
}

export function WalletConnect({ onBack, onNavigate }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [balance, setBalance] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [succes, setsucces] = useState<string>("")
  const [isUserRegistered, setIsUserRegistered] = useState(true)
  const allowedExtensions = ["pdf", "jpg", "jpeg", "png"]


  useEffect(() => {
    checkWalletConnection()
  }, [])

  useEffect(() => {
  if (succes !== "" || error !== "") {
    const timer = setTimeout(() => {
      setsucces("")
      setError("")
    }, 10000)

    return () => clearTimeout(timer)
  }
  }, [succes, error])

  const [form, setForm] = useState({
  lastName: "",
  firstName: "",
  birthDate: "",
  idCard: null as File | null,
  })

  const [errors, setErrors] = useState<string[]>([])
  const [fileName, setFileName] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, files } = e.target

    if (name === "idCard" && files) {
      setForm((prev) => ({ ...prev, idCard: files[0] }))
      setFileName(files[0].name)
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors = []
      const today = new Date()
      const birthDate = new Date(form.birthDate)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const dayDiff = today.getDate() - birthDate.getDate()
      const is18OrOlder = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))

      if (!form.lastName.trim()) newErrors.push("Last Name is required")
      if (!form.firstName.trim()) newErrors.push("First Name is required")
      if (!form.birthDate) newErrors.push("Date of Birth is required")
      if (!form.idCard) newErrors.push("ID Document is required")
      if (!is18OrOlder) newErrors.push("You need to have at least 18 years old to register.")

           // Vérification type de fichier (si fichier sélectionné)
      if (form.idCard) {
        const ext = form.idCard.name.split(".").pop()?.toLowerCase() || "";
        if (!allowedExtensions.includes(ext)) {
          newErrors.push(`Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`);
        }
      }

      setErrors(newErrors)

      if (newErrors.length === 0) {
        try {
          const formData = new FormData()
          formData.append('nom', form.lastName)
          formData.append('prenom', form.firstName)
          formData.append('date_naissance', form.birthDate)
          formData.append('id', walletAddress)
           if (form.idCard) {
          formData.append('piece_identite', form.idCard);
          }

          const res = await fetch('http://127.0.0.1:8000/api/users', {
            method: 'POST',
            body: formData, // Pas besoin de content-type, le navigateur gère ça
          })

          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || 'Error creating user')
          }
          const data = await res.json();
          setsucces('Account has been created!');
          setIsUserRegistered(true);
          setForm({
            lastName: "",
            firstName: "",
            birthDate: "",
            idCard: null,
          });
          setFileName("");

        } catch (err: unknown) {
          if (err instanceof Error) {
            setError('Error : ' + err.message)
          } else {
            setError('Unknown error occurred')
          }
      }
    }
  }

  const isuserRegistered = async (address: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/' + address, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to check user registration')
      }else {
        setIsUserRegistered(true)
      }
    }catch (err) {
      console.log("No wallet connected")
      setIsUserRegistered(false)
    }
  }

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setIsConnected(true)
          setSelectedWallet("MetaMask")
        }
      }
    } catch (err) {
      console.log("No wallet connected")
    }
  }

  const wallets = [
    {
      name: "MetaMask",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Metamask-Icon--Streamline-Svg-Logos" height="32" width="32">
        <desc>
          Metamask Icon Streamline Icon: https://streamlinehq.com
        </desc>
        <path fill="#e17726" d="M23.205225 0.9874275 13.121575 8.448625l1.87515 -4.397125 8.2085 -3.0640725Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="M0.818115 0.996155 9.00465 4.052l1.780525 4.454775L0.818115 0.996155Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m19.147225 16.855225 4.4568 0.084825 -1.5576 5.291375 -5.438275 -1.49735 2.539075 -3.87885Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m4.852525 16.855225 2.529675 3.878875 -5.429175 1.497425 -1.5481175 -5.291475 4.4476175 -0.084825Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m10.543275 7.372 0.1822 5.882675 -5.450075 -0.247975 1.550225 -2.33875 0.019625 -0.02255L10.543275 7.372Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m13.4003 7.30645 3.75445 3.33925 0.019425 0.022375 1.550275 2.33875 -5.448825 0.247925 0.124675 -5.9483Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m7.541775 16.87225 2.9759 2.318675 -3.456875 1.669025 0.480975 -3.9877Z" strokeWidth="0.25"></path>
        <path fill="#e27625" d="m16.458725 16.871875 0.471 3.988075 -3.447175 -1.669175 2.976175 -2.3189Z" strokeWidth="0.25"></path>
        <path fill="#d5bfb2" d="m13.558475 18.9724 3.4981 1.69385 -3.253925 1.546475 0.033775 -1.022125 -0.27795 -2.2182Z" strokeWidth="0.25"></path>
        <path fill="#d5bfb2" d="m10.44055 18.97315 -0.26705 2.2007 0.0219 1.037625 -3.26155 -1.54525 3.5067 -1.693075Z" strokeWidth="0.25"></path>
        <path fill="#233447" d="m9.430425 14.02245 0.914125 1.921125 -3.11225 -0.911675 2.198125 -1.00945Z" strokeWidth="0.25"></path>
        <path fill="#233447" d="m14.56965 14.02265 2.20845 1.009175 -3.12235 0.91145 0.9139 -1.920625Z" strokeWidth="0.25"></path>
        <path fill="#cc6228" d="m7.779875 16.852725 -0.5031 4.1345 -2.696325 -4.044125 3.199425 -0.090375Z" strokeWidth="0.25"></path>
        <path fill="#cc6228" d="m16.22045 16.852775 3.199525 0.0904L16.7135 20.9874l-0.49305 -4.134625Z" strokeWidth="0.25"></path>
        <path fill="#cc6228" d="m18.803175 12.773 -2.328475 2.37305 -1.795225 -0.820375 -0.85955 1.8069 -0.56345 -3.1072 5.5467 -0.252375Z" strokeWidth="0.25"></path>
        <path fill="#cc6228" d="m5.19555 12.77295 5.547675 0.2524 -0.563475 3.107225 -0.8597 -1.8067 -1.785775 0.8202 -2.338725 -2.373125Z" strokeWidth="0.25"></path>
        <path fill="#e27525" d="m5.038825 12.286075 2.6344 2.6732 0.0913 2.63905 -2.7257 -5.31225Z" strokeWidth="0.25"></path>
        <path fill="#e27525" d="M18.963975 12.28125 16.2334 17.603l0.1028 -2.643775L18.963975 12.28125Z" strokeWidth="0.25"></path>
        <path fill="#e27525" d="m10.6146 12.448725 0.106025 0.667375 0.262 1.6625 -0.168425 5.10625 -0.79635 -4.1019 -0.000275 -0.0424 0.597025 -3.291825Z" strokeWidth="0.25"></path>
        <path fill="#e27525" d="m13.384 12.439575 0.5986 3.301025 -0.00025 0.0424 -0.79835 4.11215 -0.0316 -1.028525 -0.124575 -4.1182 0.356175 -2.30885Z" strokeWidth="0.25"></path>
        <path fill="#f5841f" d="m16.5705 14.8529 -0.08915 2.2929 -2.77905 2.16525 -0.5618 -0.39695 0.62975 -3.243675 2.80025 -0.817525Z" strokeWidth="0.25"></path>
        <path fill="#f5841f" d="m7.439075 14.852975 2.790625 0.817525 0.629725 3.243625 -0.561825 0.396925 -2.7792 -2.165425 -0.079325 -2.29265Z" strokeWidth="0.25"></path>
        <path fill="#c0ac9d" d="m6.4021 20.15985 3.555475 1.68465 -0.01505 -0.719375L10.24 20.864h3.51895l0.30825 0.26025 -0.0227 0.718875 3.532925 -1.679025 -1.719125 1.420625L13.7795 23.0125H10.211525l-2.07745 -1.433625 -1.731975 -1.419025Z" strokeWidth="0.25"></path>
        <path fill="#161616" d="m13.303775 18.748225 0.5027 0.3551 0.2946 2.35045 -0.426325 -0.36H10.326425l-0.418225 0.36725 0.284925 -2.357525 0.502875 -0.355275h2.607775Z" strokeWidth="0.25"></path>
        <path fill="#763e1a" d="m22.539625 1.19397 1.2104 3.631255 -0.7559 3.67155 0.538275 0.41525 -0.728375 0.555725 0.547375 0.42275 -0.72485 0.660175 0.445025 0.322275 -1.181025 1.379325 -4.844125 -1.4104 -0.041975 -0.0225 -3.490775 -2.9447L22.539625 1.19397Z" strokeWidth="0.25"></path>
        <path fill="#763e1a" d="M1.460435 1.19397 10.4864 7.874675l-3.49075 2.9447 -0.042 0.0225 -4.844145 1.4104 -1.181015 -1.379325 0.44467 -0.322025 -0.72453 -0.6604 0.5463775 -0.422325 -0.73926 -0.5573 0.55858 -0.4155L0.25 4.82535 1.460435 1.19397Z" strokeWidth="0.25"></path>
        <path fill="#f5841f" d="m16.809475 10.533375 5.132675 1.49435 1.667525 5.1393 -4.39925 0 -3.031225 0.03825 2.204425 -4.296825 -1.57415 -2.375075Z" strokeWidth="0.25"></path>
        <path fill="#f5841f" d="m7.19055 10.533375 -1.574425 2.375075 2.204725 4.296825 -3.029725 -0.03825H0.3996575l1.65816 -5.13925 5.1327325 -1.4944Z" strokeWidth="0.25"></path>
        <path fill="#f5841f" d="m15.248075 4.026975 -1.43565 3.8774 -0.30465 5.238 -0.116575 1.64175 -0.00925 4.193975H10.617825l-0.008975 -4.1861 -0.11695 -1.651075 -0.3048 -5.23655 -1.4354 -3.8774h6.496375Z" strokeWidth="0.25"></path>
      </svg>,
      description: "Connect using browser extension",
      popular: true,
    },
    {
      name: "WalletConnect",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 350 350" width="32" height="32"><circle cx="175" cy="175" r="175" fill="#0888f0" transform="matrix(-1 0 0 1 350 0)"></circle><path fill="#fff" d="m229.916 160.179 20.601-20.474c-46.561-46.274-104.416-46.274-150.977 0l20.601 20.474c35.411-35.193 74.388-35.193 109.799 0h-.024Z"></path><path fill="#fff" d="m223.045 207.88-48.044-47.748-48.045 47.748-48.045-47.748-20.577 20.45 68.622 68.222 48.045-47.748 48.044 47.748 68.622-68.222-20.577-20.45-48.045 47.748Z"></path></svg>,
      description: "Scan with mobile wallet",
      popular: true,
    },
    {
      name: "Coinbase Wallet",
      icon: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="38" height="38" viewBox="0 0 48 48">
<circle cx="24" cy="24" r="20" fill="#2962ff"></circle><path fill="#fff" d="M24,31c-3.86,0-7-3.14-7-7s3.14-7,7-7c3.52,0,6.44,2.61,6.92,6h7.04C37.45,15.74,31.38,10,24,10	c-7.72,0-14,6.28-14,14c0,7.72,6.28,14,14,14c7.38,0,13.45-5.74,13.96-13h-7.04C30.44,28.39,27.52,31,24,31z"></path>
</svg>,
      description: "Connect with Coinbase",
      popular: false,
    },
    {
      name: "Trust Wallet",
      icon: <svg width="30" height="34" viewBox="0 0 39 43" fill="none" xmlns="http://www.w3.org/2000/svg" exponent="342423"><path d="M0.710815 6.67346L19.4317 0.606445V42.6064C6.05944 37.0059 0.710815 26.2727 0.710815 20.207V6.67346Z" fill="#0500FF"></path><path d="M38.1537 6.67346L19.4329 0.606445V42.6064C32.8051 37.0059 38.1537 26.2727 38.1537 20.207V6.67346Z" fill="url(#paint0_linear_524_75868342423)"></path><defs><linearGradient id="paint0_linear_524_75868342423" x1="33.1809" y1="-2.33467" x2="19.115" y2="42.0564" gradientUnits="userSpaceOnUse"><stop offset="0.02" stop-color="#0000FF"></stop><stop offset="0.08" stop-color="#0094FF"></stop><stop offset="0.16" stop-color="#48FF91"></stop><stop offset="0.42" stop-color="#0094FF"></stop><stop offset="0.68" stop-color="#0038FF"></stop><stop offset="0.9" stop-color="#0500FF"></stop></linearGradient></defs></svg>,
      description: "Mobile-first wallet",
      popular: false,
    },
  ]

  const handleConnect = async (walletName: string) => {
  setSelectedWallet(walletName)
  setIsConnecting(true)
  setError("")

  try {
    if (walletName === "MetaMask") {
      if (typeof window !== "undefined" && window.ethereum) {
        // Demande à MetaMask de connecter le compte
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]) // <-- ici on stocke l'adresse
          setIsConnected(true)
          isuserRegistered(accounts[0]) // Vérifie si l'utilisateur est enregistré
        } else {
          setError("No wallet address found.")
        }
      } else {
        setError("MetaMask not detected. Please install MetaMask.")
      }
      } else {
        // Connexion simulée pour d'autres wallets
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsConnected(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
      setSelectedWallet(null)
    } finally {
      setIsConnecting(false)
    }
  }


  const handleDisconnect = () => {
    setIsConnected(false)
    setSelectedWallet(null)
    setError("")
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
    } catch (err) {
      console.log("Failed to copy address")
    }
  }


  if (isConnected) {
    return (
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-4">
              Wallet Connected
            </h1>
            <p className="text-gray-300">Your {selectedWallet} wallet is now connected</p>
          </div>

          {!isUserRegistered && (
            <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8 mb-8 space-y-6">
              <p className="text-gray-300 text-lg font-semibold">You are new here?</p>

              {/* Errors */}
              {errors.length > 0 && (
                <ul className="bg-red-600/20 border border-red-500 text-red-300 rounded-lg p-4 space-y-1 text-sm">
                  {errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-black/50"
                    placeholder="Doe"
                  />
                </div>

                {/* Prénom */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-black/50"
                    placeholder="John"
                  />
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    style={{ colorScheme: "dark" }}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-black/50"
                  />
                </div>

                {/* Carte d'identité */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID Document (PDF or Image)</label>
                  <input
                    type="file"
                    name="idCard"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="hidden"
                    id="id-upload"
                  />
                  <label
                    htmlFor="id-upload"
                    className="block w-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold py-3 px-4 rounded-md text-center cursor-pointer transition"
                  >
                    Upload ID
                  </label>
                  <p className="text-sm text-gray-400 mt-1 truncate">{fileName}</p>
                  {error && (
                    <p className="text-red-600 text-sm mt-2 font-semibold">{error}</p>
                  )}
                </div>

                {/* Bouton d'inscription */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold transition duration-300"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          )}

          {(succes !== "" || error !== "") && (
            <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8 mb-8 space-y-6">
              {succes !== "" && (
                <p className="text-green-500 text-lg font-semibold">{succes}</p>
              )}
              {error !== "" && (
                <p className="text-red-500 text-lg font-semibold">{error}</p>
              )}
            </div>
          )}


          {/* Wallet Info */}
          <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Wallet Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Wallet Type</label>
                    <div className="text-white font-semibold">{selectedWallet}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Address</label>
                    <div className="flex items-center space-x-2">
                      <div className="text-white font-mono text-sm bg-black/30 px-3 py-2 rounded-lg flex-1">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </div>
                      <button
                        onClick={copyAddress}
                        className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-pink-400" />
                      </button>
                      <button className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4 text-pink-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Network</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-semibold">Ethereum Mainnet</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-6">Balance</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-white mb-2">{balance} ETH</div>
                    <div className="text-gray-400 text-sm">≈ $23,847.32 USD</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 border border-pink-500/20 rounded-xl p-4">
                      <div className="text-lg font-bold text-white">2,450</div>
                      <div className="text-gray-400 text-sm">ELDORADO</div>
                    </div>
                    <div className="bg-black/30 border border-pink-500/20 rounded-xl p-4">
                      <div className="text-lg font-bold text-white">156</div>
                      <div className="text-gray-400 text-sm">USDC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => onNavigate("swap")} className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deposit</h3>
              <p className="text-gray-400 text-sm">Add funds to your wallet</p>
            </button>

            <button onClick={() => onNavigate("swap")} className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <ArrowLeft className="w-6 h-6 text-white transform rotate-180" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Withdraw</h3>
              <p className="text-gray-400 text-sm">Transfer funds out</p>
            </button>

            <button className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Security</h3>
              <p className="text-gray-400 text-sm">Manage wallet security</p>
            </button>
          </div>

          {/* Disconnect Button */}
          <div className="text-center">
            <button
              onClick={handleDisconnect}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Connect Wallet
          </h1>
          <p className="text-gray-300">Choose your preferred wallet to get started</p>
        </div>

        {isConnecting && selectedWallet && (
          <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8 mb-8 text-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Connecting to {selectedWallet}</h3>
            <p className="text-gray-400">Please confirm the connection in your wallet...</p>
          </div>
        )}

        {error && (
          <div className="backdrop-blur-xl bg-black/30 border border-red-500/30 rounded-3xl p-8 mb-8 text-center">
            <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {/* Wallet Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting || isConnected}
              className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-3xl p-6 hover:border-pink-500/40 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center space-x-1">
                <div className="text-4xl">{wallet.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{wallet.name}</h3>
                    {wallet.popular && (
                      <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{wallet.description}</p>
                </div>
                <div className="w-8 h-8 border-2 border-pink-500/30 rounded-full flex items-center justify-center group-hover:border-pink-500 transition-colors">
                  <div className="w-3 h-3 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Security Notice */}
        <div className="backdrop-blur-xl bg-black/20 border border-yellow-500/30 rounded-2xl p-6 mt-8">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Security Notice</h3>
              <p className="text-gray-300 text-sm">
                We will never ask for your seed phrase or private keys. Always verify the URL before connecting your
                wallet. Make sure you're on the official CyberCasino domain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


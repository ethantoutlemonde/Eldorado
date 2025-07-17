"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function createPage() {
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
  walletAddress: "",
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
  e.preventDefault();
  const newErrors = [];
  const today = new Date();
  const birthDate = new Date(form.birthDate);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const is18OrOlder = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

  if (!form.lastName.trim()) newErrors.push("Last Name is required");
  if (!form.firstName.trim()) newErrors.push("First Name is required");
  if (!form.birthDate) newErrors.push("Date of Birth is required");
  if (!form.idCard) newErrors.push("ID Document is required");
  if (!form.walletAddress) newErrors.push("Wallet address is required");
  if (!is18OrOlder) newErrors.push("You need to have at least 18 years old to register.");

   // Vérification type de fichier (si fichier sélectionné)
  if (form.idCard) {
    const ext = form.idCard.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      newErrors.push(`Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`);
    }
  }

  setErrors(newErrors);

  if (newErrors.length === 0) {
    try {
      const formData = new FormData();
      formData.append('nom', form.lastName);
      formData.append('prenom', form.firstName);
      formData.append('date_naissance', form.birthDate);
      formData.append('id', form.walletAddress);
      if (form.idCard) {
        formData.append('piece_identite', form.idCard);
      }

      const res = await fetch('http://127.0.0.1:8000/api/users', {
        method: 'POST',
        body: formData, // PAS d'entête Content-Type ici !
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error creating user');
      }
      const data = await res.json();
      setsucces('Account has been created!');
      setIsUserRegistered(true);
      setForm({
        lastName: "",
        firstName: "",
        birthDate: "",
        walletAddress: "",
        idCard: null,
      });
      setFileName("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error: ' + err.message);
      } else {
        setError('Unknown error occurred');
      }
    }
  }
}

return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-md">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <p className="text-sm sm:text-base text-gray-600">User Profile</p>
          </div>
        </div>
      </div>

        {/* Errors */}
              {errors.length > 0 && (
                <ul className="bg-red-600/20 border border-red-500 text-red-900 rounded-lg p-4 space-y-1 text-sm mb-4">
                  {errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              )}
              {succes.length > 0 && (
                <ul className="bg-green-600/20 border border-green-500 text-green-900 rounded-lg p-4 space-y-1 text-sm mb-4">
                    <li>• {succes}</li>
                </ul>
              )}
              {error.length > 0 && (
                <ul className="bg-red-600/20 border border-red-500 text-red-900 rounded-lg p-4 space-y-1 text-sm mb-4">
                    <li>• {error}</li>
                </ul>
              )}
              


        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          {/* Nom */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Wallet</label>
            <input
              type="text"
              name="walletAddress"
              value={form.walletAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
            />
          </div>

          {/* Carte d'identité */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">ID Document (PDF or Image)</label>
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
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-3 px-4 rounded-md text-center cursor-pointer transition"
            >
              Upload ID
            </label>
            <p className="text-sm text-gray-600 mt-1 truncate">{fileName}</p>
            {error && (
              <p className="text-red-600 text-sm mt-2 font-semibold">{error}</p>
            )}
          </div>

          {/* Bouton d'inscription */}
          <div>
            <label
              className="text-white text-sm font-semibold py-3 px-4 rounded-md text-center cursor-pointer transition"
            > </label>
            <button
              type="submit"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 px-4 rounded-md text-center cursor-pointer transition"
            >
              Register
            </button>
          </div>
        </form>
    </div>
)}



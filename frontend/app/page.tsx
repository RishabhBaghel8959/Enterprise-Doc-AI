"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { useEffect } from "react"
import Chat from "../components/Chat"
import Upload from "../components/Upload"

export default function Home() {
  const router = useRouter()
  const { token, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login")
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0f19] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white">
      {/* LEFT PANEL */}
      <div className="w-[320px] border-r border-gray-800 p-5 flex flex-col gap-6">

        {/* TITLE */}
        <div>
          <h1 className="text-xl font-semibold">EnterpriseDocAI</h1>
          <p className="text-sm text-gray-400">
            Upload and query your documents
          </p>
        </div>

        {/* UPLOAD CARD */}
        <div className="bg-[#111827] p-4 rounded-xl border border-gray-700">
          <Upload />
        </div>

        {/* DOC LIST (dummy for now) */}
        <div className="flex-1">
          <h2 className="text-sm text-gray-400 mb-2">Documents</h2>

          <div className="space-y-2">
            <div className="p-2 bg-[#1f2937] rounded-lg text-sm">
              sample_doc.pdf
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col">
        <Chat />
      </div>
    </div>
  )
}
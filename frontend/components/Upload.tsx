"use client"

export default function Upload() {
  const upload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    await fetch("http://127.0.0.1:8000/ingest/upload", {
      method: "POST",
      body: formData,
    })

    alert("Uploaded!")
  }

  return (
    <label className="block w-full text-center bg-green-600 p-3 rounded-lg cursor-pointer hover:bg-green-700">
      Upload Document
      <input type="file" hidden onChange={upload} />
    </label>
  )
}
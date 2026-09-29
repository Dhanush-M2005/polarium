import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename

  const reportsDir = path.join(process.cwd(), 'public', 'reports')
  const docsDir = path.join(process.cwd(), 'raw_knowledge_base', 'scraped_documents')

  let filePath = path.join(reportsDir, filename)

  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, filename)
  }

  if (!fs.existsSync(filePath)) {
    try {
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir)
        const match = files.find(
          (f) => f.toLowerCase() === filename.toLowerCase() || path.parse(f).name.toLowerCase() === path.parse(filename).name.toLowerCase()
        )
        if (match) filePath = path.join(reportsDir, match)
      }
      if (!fs.existsSync(filePath) && fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir)
        const match = files.find(
          (f) => f.toLowerCase() === filename.toLowerCase() || path.parse(f).name.toLowerCase() === path.parse(filename).name.toLowerCase()
        )
        if (match) filePath = path.join(docsDir, match)
      }
    } catch (e) {
      console.error('Error scanning reports directories:', e)
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const fileBuffer = fs.readFileSync(filePath)
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (err) {
      console.error('Error reading PDF report file:', err)
    }
  }

  try {
    const backendRes = await fetch(`http://127.0.0.1:8000/api/reports/${filename}`)
    if (backendRes.ok) {
      const arrayBuffer = await backendRes.arrayBuffer()
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
  } catch (proxyErr) {
    console.warn('Backend proxy attempt failed:', proxyErr)
  }

  return NextResponse.json({ error: `Report '${filename}' not found` }, { status: 404 })
}

export async function HEAD(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  return GET(request, context)
}

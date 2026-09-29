import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename

  // Target directory for scraped documents
  const docsDir = path.join(process.cwd(), 'raw_knowledge_base', 'scraped_documents')
  const reportsDir = path.join(process.cwd(), 'public', 'reports')

  let filePath = path.join(docsDir, filename)

  // 1. Direct match in scraped_documents
  if (!fs.existsSync(filePath)) {
    // 2. Check public/reports
    filePath = path.join(reportsDir, filename)
  }

  // 3. Case-insensitive search in scraped_documents
  if (!fs.existsSync(filePath)) {
    try {
      if (fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir)
        const match = files.find(
          (f) => f.toLowerCase() === filename.toLowerCase() || path.parse(f).name.toLowerCase() === path.parse(filename).name.toLowerCase()
        )
        if (match) {
          filePath = path.join(docsDir, match)
        }
      }
    } catch (e) {
      console.error('Error scanning scraped_documents:', e)
    }
  }

  // 4. Return local file if found
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
      console.error('Error reading PDF file:', err)
    }
  }

  // 5. Backend Proxy Fallback (FastAPI on port 8000)
  try {
    const backendRes = await fetch(`http://127.0.0.1:8000/api/scraped_docs/${filename}`)
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

  // 6. Clean JSON 404 response (Never HTML page inside iframe)
  return NextResponse.json({ error: `Document '${filename}' not found` }, { status: 404 })
}

export async function HEAD(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  return GET(request, context)
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "N\u00e3o autorizado" }, { status: 401 })
    }

    const { html_content, filename } = await request.json()

    if (!html_content) {
      return NextResponse.json(
        { error: "Conte\u00fado HTML \u00e9 obrigat\u00f3rio" },
        { status: 400 }
      )
    }

    // Step 1: Create the PDF generation request
    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html_content,
        pdf_options: { 
          format: 'A4',
          print_background: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        },
        base_url: process.env.NEXTAUTH_URL || '',
      }),
    })

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ error: 'Falha ao criar requisi\u00e7\u00e3o de PDF' }))
      return NextResponse.json({ success: false, error: error?.error ?? 'Erro desconhecido' }, { status: 500 })
    }

    const { request_id } = await createResponse.json()
    if (!request_id) {
      return NextResponse.json({ success: false, error: 'Nenhum ID de requisi\u00e7\u00e3o retornado' }, { status: 500 })
    }

    // Step 2: Poll for status until completion
    const maxAttempts = 300
    let attempts = 0

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          request_id: request_id, 
          deployment_token: process.env.ABACUSAI_API_KEY 
        }),
      })

      const statusResult = await statusResponse.json()
      const status = statusResult?.status || 'FAILED'
      const result = statusResult?.result || null

      if (status === 'SUCCESS') {
        if (result && result.result) {
          const pdfBuffer = Buffer.from(result.result, 'base64')
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename || 'relatorio'}.pdf"`,
            },
          })
        } else {
          return NextResponse.json({ success: false, error: 'Gera\u00e7\u00e3o de PDF completada mas sem dados' }, { status: 500 })
        }
      } else if (status === 'FAILED') {
        const errorMsg = result?.error || 'Gera\u00e7\u00e3o de PDF falhou'
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
      }
      
      attempts++
    }

    return NextResponse.json({ success: false, error: 'Tempo limite excedido na gera\u00e7\u00e3o do PDF' }, { status: 500 })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ success: false, error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
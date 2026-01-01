import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [invalidChars, setInvalidChars] = useState<string[]>([])
  const [isCompared, setIsCompared] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const extractCellsFromExcel = async (file: File): Promise<Set<string>> => {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const cells = new Set<string>()

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

      jsonData.forEach((row) => {
        row.forEach((cell) => {
          if (cell != null) {
            const str = String(cell).trim()
            if (str) {
              cells.add(str)
            }
          }
        })
      })
    })

    return cells
  }

  const handleCompare = useCallback(async () => {
    if (!sourceFile || !referenceFile) return

    setIsLoading(true)
    try {
      const sourceChars = await extractCellsFromExcel(sourceFile)
      const referenceChars = await extractCellsFromExcel(referenceFile)

      const invalid: string[] = []
      referenceChars.forEach((char) => {
        if (!sourceChars.has(char)) {
          invalid.push(char)
        }
      })

      // Sort a-z (case-insensitive, with special characters at the end)
      invalid.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

      setInvalidChars(invalid)
      setIsCompared(true)
    } catch (error) {
      console.error('Error comparing files:', error)
      alert('Error reading Excel files. Please make sure they are valid Excel files.')
    } finally {
      setIsLoading(false)
    }
  }, [sourceFile, referenceFile])

  const handleReset = () => {
    setSourceFile(null)
    setReferenceFile(null)
    setInvalidChars([])
    setIsCompared(false)
  }

  const handleDownload = () => {
    if (invalidChars.length === 0) return

    const content = invalidChars.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'invalid-results.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <h1>9n Excel Letter Validation</h1>
      <p className="description">
        Upload a Source file (contains valid cell values) and a Reference file to validate.
        Cell values in Reference that are not in Source will be displayed.
      </p>

      <div className="upload-section">
        <div className="upload-box">
          <label htmlFor="source-file">Source File (Valid Characters)</label>
          <input
            type="file"
            id="source-file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setSourceFile(e.target.files?.[0] || null)
              setIsCompared(false)
            }}
          />
          {sourceFile && <span className="file-name">{sourceFile.name}</span>}
        </div>

        <div className="upload-box">
          <label htmlFor="reference-file">Reference File (To Validate)</label>
          <input
            type="file"
            id="reference-file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setReferenceFile(e.target.files?.[0] || null)
              setIsCompared(false)
            }}
          />
          {referenceFile && <span className="file-name">{referenceFile.name}</span>}
        </div>
      </div>

      <div className="button-section">
        <button
          onClick={handleCompare}
          disabled={!sourceFile || !referenceFile || isLoading}
          className="compare-btn"
        >
          {isLoading ? 'Comparing...' : 'Compare'}
        </button>
        <button onClick={handleReset} className="reset-btn">
          Reset
        </button>
      </div>

      {isCompared && (
        <div className="result-section">
          <h2>Validation Results</h2>
          {invalidChars.length === 0 ? (
            <div className="success-message">
              All values in Reference are valid (exist in Source).
            </div>
          ) : (
            <>
              <div className="error-message">
                Found {invalidChars.length} invalid value(s) in Reference:
              </div>
              <div className="invalid-chars">
                {invalidChars.map((char, index) => (
                  <span key={index} className="char-item invalid-char">
                    {char}
                  </span>
                ))}
              </div>
              <button onClick={handleDownload} className="download-btn">
                Download Invalid Results (.txt)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App

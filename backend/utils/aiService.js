/**
 * aiService.js — OpenRouter code evaluation
 *
 * Key fix: removed `response_format: { type: 'json_object' }` — that parameter
 * is only supported by a subset of OpenRouter models (OpenAI-compatible ones).
 * deepseek/deepseek-coder ignores or rejects it, causing the response to come
 * back as plain text that fails JSON parsing.  We enforce JSON output through
 * the prompt instead, which works across all models.
 */

// Pull the first {...} block out of any string (handles markdown fences too)
function extractFirstJsonObject(text) {
  if (!text || typeof text !== 'string') return null

  // Strip markdown code fences if present  ```json ... ```
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')

  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0])
  } catch {
    // Try a second pass on the original text in case stripping broke something
    const fallback = text.match(/\{[\s\S]*\}/)
    if (!fallback) return null
    try { return JSON.parse(fallback[0]) } catch { return null }
  }
}

async function evaluateCode(code, problemDescription, { taskTitle = '', taskDescription = '' } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY

  // ── Key check ────────────────────────────────────────────────────────────
  console.log('[AI] OPENROUTER_API_KEY present:', !!apiKey, '| length:', apiKey?.length ?? 0)

  if (!apiKey || !apiKey.trim()) {
    return {
      score: 0,
      feedback: 'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.',
      errors: ['OPENROUTER_API_KEY is missing'],
      suggestions: ['Add OPENROUTER_API_KEY=sk-or-v1-... to backend/.env and restart the server.'],
      optimizedCode: null,
    }
  }

  const title       = (taskTitle       || '').trim()
  const description = (taskDescription || problemDescription || '').trim()
  const userCode    = (code            || '').trim()
  const model       = (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat').trim()

  // Single combined message — no system role, maximally compatible
  const prompt = [
    'You are a senior software engineer evaluating a student code submission.',
    'You MUST respond with ONLY a raw JSON object — no markdown, no explanation, no code fences.',
    '',
    `Task Title: ${title || '(not provided)'}`,
    `Task Description: ${description || '(not provided)'}`,
    '',
    'Student Code:',
    userCode || '(empty)',
    '',
    'Return this exact JSON structure and nothing else:',
    '{',
    '  "correctnessScore": <integer 0-100>,',
    '  "feedback": "<one paragraph evaluation summary>",',
    '  "errors": ["<error description>"],',
    '  "suggestions": ["<actionable improvement>"],',
    '  "optimizedCode": "<rewritten code string, or null>"',
    '}',
    '',
    'Scoring:',
    '  90-100 = correct and clean',
    '  70-89  = mostly correct, minor issues',
    '  50-69  = partially correct, logic errors',
    '  0-49   = incorrect or incomplete',
    '',
    'IMPORTANT: output ONLY the JSON object. No text before or after it.',
  ].join('\n')

  const FALLBACK_MODEL = 'openai/gpt-4o-mini'

  // ── Helper: call OpenRouter with a given model ────────────────────────────
  async function callOpenRouter(modelId) {
    console.log('[AI] MODEL USED:', modelId, '| code length:', userCode.length)

    const body = JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 900,
      // response_format intentionally omitted — not supported by all models
    })

    let resp
    try {
      resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'DevMate',
        },
        body,
      })
    } catch (networkErr) {
      console.error('[AI] Network error reaching OpenRouter:', networkErr.message)
      throw new Error(`Network error: ${networkErr.message}`)
    }

    const rawText = await resp.text().catch(() => '')
    console.log('[AI] RESPONSE STATUS:', resp.status, '| model:', modelId)
    console.log('[AI] Raw response (first 600 chars):', rawText.slice(0, 600))

    return { ok: resp.ok, status: resp.status, rawText }
  }

  // ── Primary attempt ───────────────────────────────────────────────────────
  let { ok, status, rawText } = await callOpenRouter(model)

  // ── Fallback if primary model is invalid or rate-limited ─────────────────
  if (!ok && model !== FALLBACK_MODEL) {
    console.warn(`[AI] Primary model "${model}" failed (${status}). Retrying with fallback: ${FALLBACK_MODEL}`)
    ;({ ok, status, rawText } = await callOpenRouter(FALLBACK_MODEL))
  }

  if (!ok) {
    console.error('[AI] Both primary and fallback models failed. Status:', status)
    throw new Error(`OpenRouter error ${status}: ${rawText.slice(0, 200) || 'Unknown error'}`)
  }

  // ── Parse the outer HTTP response ────────────────────────────────────────
  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    console.error('[AI] Could not parse HTTP response as JSON:', rawText.slice(0, 300))
    throw new Error('OpenRouter returned non-JSON HTTP response')
  }

  // OpenRouter sometimes wraps under data.data
  const payload = data?.data ?? data

  const content =
    payload?.choices?.[0]?.message?.content ??
    payload?.choices?.[0]?.text ??
    null

  console.log('[AI] Extracted content:', String(content ?? '').slice(0, 400))

  if (!content) {
    console.error('[AI] No content field in response. Full payload:', JSON.stringify(payload).slice(0, 400))
    return {
      score: 0,
      feedback: 'AI returned an empty response. Please try again.',
      errors: [],
      suggestions: ['Try submitting again — the model may have timed out.'],
      optimizedCode: null,
    }
  }

  // ── Parse the AI's JSON answer ────────────────────────────────────────────
  const parsed = extractFirstJsonObject(content)

  if (!parsed) {
    console.error('[AI] Could not extract JSON from content:', content.slice(0, 400))
    // Return the raw text as feedback so the user sees something useful
    return {
      score: 0,
      feedback: content.slice(0, 500),
      errors: ['AI did not return valid JSON — raw response shown above as feedback.'],
      suggestions: ['Try again or switch to a different model via OPENROUTER_MODEL in .env.'],
      optimizedCode: null,
    }
  }

  // Normalise field names — models vary between "score" and "correctnessScore"
  const rawScore = parsed.correctnessScore ?? parsed.score ?? 0
  const score = Math.max(0, Math.min(100, Math.round(Number(rawScore) || 0)))

  console.log('[AI] Parsed score:', score, '| feedback length:', String(parsed.feedback ?? '').length)

  return {
    score,
    feedback:      typeof parsed.feedback      === 'string' ? parsed.feedback.trim() : 'Evaluation complete.',
    errors:        Array.isArray(parsed.errors)              ? parsed.errors.map(String)      : [],
    suggestions:   Array.isArray(parsed.suggestions)         ? parsed.suggestions.map(String) : [],
    optimizedCode: typeof parsed.optimizedCode === 'string' && parsed.optimizedCode.trim()
      ? parsed.optimizedCode
      : null,
  }
}

module.exports = { evaluateCode }

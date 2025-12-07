import { NextResponse } from 'next/server'

/**
 * Validate that a value exists and is a non-empty string
 */
export function validateString(
  value: unknown,
  fieldName: string,
): string | null {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate that a value exists and is a number
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
): number | null {
  if (value === undefined || value === null) {
    return `${fieldName} is required`
  }
  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num) || !Number.isFinite(num)) {
    return `${fieldName} must be a valid number`
  }
  return null
}

/**
 * Validate that a value exists and is an integer
 */
export function validateInteger(
  value: unknown,
  fieldName: string,
): number | null {
  const numError = validateNumber(value, fieldName)
  if (numError) return numError

  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(num)) {
    return `${fieldName} must be an integer`
  }
  return null
}

/**
 * Create a validation error response
 */
export function validationError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Validate request body contains required string fields
 */
export function validateRequiredStrings(
  body: Record<string, unknown>,
  fields: string[],
): string | null {
  for (const field of fields) {
    const error = validateString(body[field], field)
    if (error) return error
  }
  return null
}

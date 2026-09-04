import { NextRequest } from 'next/server';
import { POST as transfersPOST } from '@/app/api/transfers/route';

/**
 * @deprecated Legacy transfer endpoint.
 * Canonical endpoint: POST /api/transfers
 * Delegates directly to the canonical route handler to ensure identical logic without code duplication.
 */
export async function POST(request: NextRequest) {
  return transfersPOST(request);
}

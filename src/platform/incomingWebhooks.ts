/**
 * Incoming Webhooks Module — Platform API (ingress event source)
 *
 * A tokened endpoint: an external POST to /api/hooks/{token} drops an `incoming_webhook` event on
 * the bus carrying the request body, which automations (and any other subscriber) react to. This
 * module is the ADMIN/OWNER management surface — CRUD plus minting/rotating/revoking the secret
 * token. The receiver itself is public (authenticated purely by the token).
 *
 * Routes: /api/incoming-webhooks (CRUD) + /api/incoming-webhooks/{id}/token (mint/revoke).
 */

import type { HttpClient } from '../core';

/**
 * How a webhook verifies its sender. Unset = no verification, or the default HMAC check
 * (`sha256=<hex>` in `X-Signature-256`) once `signingSecretRef` names the workspace secret
 * holding the sender's key. `signatureScheme` picks a preset (see
 * {@link IncomingWebhooksModule.signatureSchemes}) or `custom`, described by `signatureConfig`.
 */
export interface IncomingWebhookSignature {
  /** Slug of the workspace secret holding the sender's signing key. */
  signingSecretRef?: string | null;
  /** The header carrying the signature (defaults to X-Signature-256). */
  signatureHeader?: string | null;
  /** A core preset, an integration's preset, or `custom`. */
  signatureScheme?: string | null;
  /** The URL the sender signs, for schemes that sign the URL (when it differs from the receiver's). */
  signatureUrl?: string | null;
  /** The construction for `custom`. */
  signatureConfig?: Record<string, unknown> | null;
}

/** A scheme a webhook can verify with: core presets, then integration presets, then `custom`. */
export interface IncomingWebhookSignatureScheme {
  name: string;
  notes: string;
  /** `core`, or the slug of the integration that contributes it. */
  source: string;
}

export interface IncomingWebhook extends IncomingWebhookSignature {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  description: string | null;
  enabled: boolean;
  /** The secret credential; null until minted. Present the receiver URL as /api/hooks/{token}. */
  token: string | null;
  receivedCount: number;
  lastReceivedAt: string | null;
}

export interface IncomingWebhookCreate extends IncomingWebhookSignature {
  name: string;
  slug?: string;
  description?: string;
  enabled?: boolean;
}

export interface IncomingWebhookUpdate extends IncomingWebhookSignature {
  name?: string;
  description?: string;
  enabled?: boolean;
}

export class IncomingWebhooksModule {
  constructor(private http: HttpClient) {}

  /** List the workspace's incoming webhooks. */
  async list(): Promise<IncomingWebhook[]> {
    return this.http.get<IncomingWebhook[]>('/api/incoming-webhooks');
  }

  /** The signature schemes a webhook can pick (`signatureScheme`). */
  async signatureSchemes(): Promise<IncomingWebhookSignatureScheme[]> {
    return this.http.get<IncomingWebhookSignatureScheme[]>('/api/incoming-webhooks/signature-schemes');
  }

  async get(id: string): Promise<IncomingWebhook> {
    const validId = this.http.validatePathParam(id, 'incoming webhook id');
    return this.http.get<IncomingWebhook>(`/api/incoming-webhooks/${validId}`);
  }

  /** Create an incoming webhook (no token yet — mint one with {@link mintToken}). */
  async create(body: IncomingWebhookCreate): Promise<IncomingWebhook> {
    return this.http.post<IncomingWebhook>('/api/incoming-webhooks', body);
  }

  async update(id: string, body: IncomingWebhookUpdate): Promise<IncomingWebhook> {
    const validId = this.http.validatePathParam(id, 'incoming webhook id');
    return this.http.patch<IncomingWebhook>(`/api/incoming-webhooks/${validId}`, body);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'incoming webhook id');
    await this.http.delete<void>(`/api/incoming-webhooks/${validId}`);
  }

  /** Mint a fresh secret token (rotating any existing one — the old URL stops working). */
  async mintToken(id: string): Promise<IncomingWebhook> {
    const validId = this.http.validatePathParam(id, 'incoming webhook id');
    return this.http.post<IncomingWebhook>(`/api/incoming-webhooks/${validId}/token`, {});
  }

  /** Revoke the token so the receiver rejects all further requests to this webhook. */
  async revokeToken(id: string): Promise<IncomingWebhook> {
    const validId = this.http.validatePathParam(id, 'incoming webhook id');
    return this.http.delete<IncomingWebhook>(`/api/incoming-webhooks/${validId}/token`);
  }
}

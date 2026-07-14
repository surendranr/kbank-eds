/*
 * App Builder web action: exchange-rate BFF.
 * Fetches open.er-api server-side and returns the SAME trimmed shape the EDS
 * api-demo block expects: { base, updated, rates: [{ code, rate }] }.
 *
 * In a real bank use case this is where an API key / partner credential would
 * live (read from params, never shipped to the browser), plus aggregation and
 * response shaping. Here it just demonstrates the server-side hop.
 */

/* global fetch */

const DEFAULT_BASE = 'USD';

async function main(params) {
  const base = (params.base || DEFAULT_BASE).toUpperCase();
  const url = `https://open.er-api.com/v6/latest/${base}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: { error: `upstream HTTP ${resp.status}` },
      };
    }
    const raw = await resp.json();
    const rates = raw.rates || {};
    const shaped = {
      base: raw.base_code || base,
      updated: raw.time_last_update_utc || '',
      rates: Object.keys(rates).map((code) => ({ code, rate: rates[code] })),
    };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: shaped,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: { error: err.message },
    };
  }
}

exports.main = main;

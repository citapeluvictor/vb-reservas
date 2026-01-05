export default {
    async fetch(request, env) {
        // The Google Apps Script URL (backend)
        const GAS_URL = "https://script.google.com/macros/s/AKfycbzEIOY7bx7BTco_Js8DTWAn2OU6HLStg1_jC9Seg-lZ_J5ra0S2BppcJkUNHKmjW79GKg/exec";

        // CORS Headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // Handle Preflight (OPTIONS)
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Forward the request to GAS
        // We create a new request based on the incoming one, but targeting GAS_URL
        const proxyRequest = new Request(GAS_URL, {
            method: request.method,
            headers: {
                ...request.headers,
                // Ensure we accept JSON
                "Accept": "application/json",
            },
            // Forward the body (for POST requests)
            body: request.body
        });

        try {
            const response = await fetch(proxyRequest);

            // Create a new response with the data from GAS + CORS headers
            const newResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });

            newResponse.headers.set("Access-Control-Allow-Origin", "*");
            return newResponse;

        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
    }
};

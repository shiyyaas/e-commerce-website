import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing Authorization header")
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error("Unauthorized user request")
    }

    const { items, shipping_address } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid or empty items payload")
    }

    // Use service role client for authoritative price & stock validation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    let totalCents = 0
    const validatedItems = []

    for (const item of items) {
      const { data: product, error: prodError } = await supabaseAdmin
        .from("products")
        .select("id, title, price, stock")
        .eq("id", item.product_id)
        .single()

      if (prodError || !product) {
        throw new Error(`Product not found: ${item.product_id}`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`)
      }

      const unitAmountCents = Math.round(Number(product.price) * 100)
      totalCents += unitAmountCents * item.quantity
      validatedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
      })
    }

    if (totalCents <= 0) {
      throw new Error("Order total must be greater than zero")
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        shipping_city: shipping_address?.city || "",
        shipping_postal_code: shipping_address?.postalCode || "",
        items_count: items.reduce((acc, i) => acc + i.quantity, 0),
      },
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})

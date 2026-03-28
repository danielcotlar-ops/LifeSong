import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.100.1'

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id

      if (!orderId) {
        console.error('No order_id in session metadata')
        return new Response('ok', { status: 200 })
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )

      // Get the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Order not found:', orderId)
        return new Response('ok', { status: 200 })
      }

      // Update order status to paid
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', orderId)

      // Insert song_requests row from quiz_data
      const quiz = order.quiz_data || {}
      await supabaseAdmin
        .from('song_requests')
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          recipient_name: quiz.recipientName,
          occasion: quiz.occasion,
          tone: quiz.tone,
          energy: quiz.energy,
          feelings: quiz.feelings || [],
          relationship: quiz.relationship,
          themes: quiz.themes || [],
          chorus_hook: quiz.chorusHook || null,
          golden_memory: quiz.goldenMemory || null,
          avoid: quiz.avoid || null,
        })

      console.log(`Order ${orderId} marked as paid, song_request created`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationPayload {
  business_id: string;
  verification_type: 'document' | 'location' | 'identity';
  documents?: string[];
  location_verification?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  admin_notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: VerificationPayload = await req.json()
    
    // Get business details
    const { data: business, error: businessError } = await supabaseClient
      .from('businesses')
      .select('*, profiles(*)')
      .eq('id', payload.business_id)
      .single()

    if (businessError || !business) {
      throw new Error('Business not found')
    }

    // Create verification record
    const verificationData = {
      business_id: payload.business_id,
      verification_type: payload.verification_type,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      documents: payload.documents || [],
      location_data: payload.location_verification || null,
      admin_notes: payload.admin_notes || '',
      verified_at: null,
      verified_by: null
    }

    const { data: verification, error: verificationError } = await supabaseClient
      .from('business_verifications')
      .insert(verificationData)
      .select()
      .single()

    if (verificationError) {
      throw verificationError
    }

    // Perform automated checks
    let autoVerificationScore = 0
    const checks = []

    // Document verification
    if (payload.verification_type === 'document' && payload.documents?.length) {
      // Simulate document analysis (in real app, integrate with document verification service)
      const hasBusinessLicense = payload.documents.some(doc => 
        doc.includes('license') || doc.includes('permit')
      )
      
      if (hasBusinessLicense) {
        autoVerificationScore += 30
        checks.push('Business license document detected')
      }

      const hasTaxDocument = payload.documents.some(doc => 
        doc.includes('tax') || doc.includes('ein')
      )
      
      if (hasTaxDocument) {
        autoVerificationScore += 20
        checks.push('Tax identification document detected')
      }
    }

    // Location verification
    if (payload.verification_type === 'location' && payload.location_verification) {
      const { latitude, longitude, address } = payload.location_verification
      
      // Verify address matches coordinates (simplified check)
      if (latitude && longitude && address) {
        autoVerificationScore += 25
        checks.push('Location coordinates match provided address')
      }

      // Check if location is in commercial area (simplified)
      const isCommercialArea = Math.random() > 0.3 // Simulate commercial area check
      if (isCommercialArea) {
        autoVerificationScore += 15
        checks.push('Location appears to be in commercial area')
      }
    }

    // Identity verification
    if (payload.verification_type === 'identity') {
      // Check if business owner profile is complete
      const profile = business.profiles
      if (profile?.full_name && profile?.phone_number && profile?.email) {
        autoVerificationScore += 20
        checks.push('Business owner profile is complete')
      }

      // Check business age
      const businessAge = Date.now() - new Date(business.created_at).getTime()
      const daysOld = businessAge / (1000 * 60 * 60 * 24)
      
      if (daysOld > 30) {
        autoVerificationScore += 10
        checks.push('Business profile is over 30 days old')
      }
    }

    // Auto-approve if score is high enough
    let finalStatus = 'pending'
    if (autoVerificationScore >= 70) {
      finalStatus = 'approved'
      
      // Update business verification status
      await supabaseClient
        .from('businesses')
        .update({ 
          is_verified: true,
          verification_level: 'basic',
          verified_at: new Date().toISOString()
        })
        .eq('id', payload.business_id)

      // Update verification record
      await supabaseClient
        .from('business_verifications')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verification_score: autoVerificationScore,
          auto_verification_checks: checks
        })
        .eq('id', verification.id)

      // Send approval notification
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: business.owner_id,
          type: 'business_verification',
          title: 'Business Verified! 🎉',
          message: `Your business "${business.name}" has been successfully verified and is now live on TownTap!`,
          data: {
            business_id: payload.business_id,
            verification_type: payload.verification_type,
            verification_level: 'basic'
          },
          action_url: `/business/dashboard`,
          send_push: true,
          send_email: true
        })
      })

    } else if (autoVerificationScore >= 40) {
      // Require manual review
      finalStatus = 'requires_review'
      
      await supabaseClient
        .from('business_verifications')
        .update({
          status: 'requires_review',
          verification_score: autoVerificationScore,
          auto_verification_checks: checks,
          admin_notes: `Auto-verification score: ${autoVerificationScore}/100. Manual review required.`
        })
        .eq('id', verification.id)

      // Notify admins for manual review
      const { data: admins } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      for (const admin of admins || []) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_id: admin.id,
            type: 'admin_review_required',
            title: 'Business Verification Review Required',
            message: `Business "${business.name}" requires manual verification review (Score: ${autoVerificationScore}/100)`,
            data: {
              business_id: payload.business_id,
              verification_id: verification.id,
              verification_type: payload.verification_type,
              score: autoVerificationScore
            },
            action_url: `/admin/verifications/${verification.id}`,
            send_push: true
          })
        })
      }

    } else {
      // Reject verification
      finalStatus = 'rejected'
      
      await supabaseClient
        .from('business_verifications')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verification_score: autoVerificationScore,
          auto_verification_checks: checks,
          admin_notes: `Auto-verification failed. Score: ${autoVerificationScore}/100. Please resubmit with better documentation.`
        })
        .eq('id', verification.id)

      // Send rejection notification
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: business.owner_id,
          type: 'business_verification',
          title: 'Verification Needs Improvement',
          message: `Your business verification for "${business.name}" needs additional documentation. Please check the requirements and resubmit.`,
          data: {
            business_id: payload.business_id,
            verification_type: payload.verification_type,
            score: autoVerificationScore,
            required_improvements: checks.length < 2 ? ['More documentation required', 'Complete business profile'] : []
          },
          action_url: `/business/verification`,
          send_push: true,
          send_email: true
        })
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        verification_id: verification.id,
        status: finalStatus,
        score: autoVerificationScore,
        checks: checks,
        message: finalStatus === 'approved' 
          ? 'Business verified successfully!' 
          : finalStatus === 'requires_review'
          ? 'Verification submitted for manual review'
          : 'Verification needs improvement'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
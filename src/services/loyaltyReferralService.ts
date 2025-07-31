import { supabase } from '../lib/supabase';

// Loyalty and referral interfaces
export interface LoyaltyProgram {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: 'points' | 'visits' | 'spending' | 'tier';
  isActive: boolean;
  rules: {
    pointsPerRupee?: number;
    pointsPerVisit?: number;
    minOrderValue?: number;
    multipliers?: Array<{
      condition: string;
      multiplier: number;
    }>;
  };
  rewards: Array<{
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    discountType: 'percentage' | 'fixed_amount' | 'free_item';
    discountValue: number;
    validityDays: number;
    maxUses?: number;
    minOrderValue?: number;
  }>;
  tiers?: Array<{
    name: string;
    minPoints: number;
    benefits: string[];
    multiplier: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  businessId: string;
  totalPoints: number;
  availablePoints: number;
  totalSpent: number;
  totalVisits: number;
  currentTier?: string;
  joinDate: string;
  lastActivity: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  businessId: string;
  orderId?: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
  points: number;
  description: string;
  expiresAt?: string;
  created_at: string;
}

export interface ReferralProgram {
  id: string;
  type: 'platform' | 'business';
  businessId?: string;
  name: string;
  description: string;
  isActive: boolean;
  referrerReward: {
    type: 'points' | 'discount' | 'cash' | 'free_service';
    value: number;
    maxRewards?: number;
  };
  refereeReward: {
    type: 'points' | 'discount' | 'cash' | 'free_service';
    value: number;
  };
  conditions: {
    minOrderValue?: number;
    validityDays?: number;
    maxUses?: number;
  };
  created_at: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  programId: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  orderValue?: number;
  rewardsGiven: boolean;
  created_at: string;
  completed_at?: string;
}

export interface CouponCode {
  id: string;
  businessId?: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_one_get_one';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCategories?: string[];
  excludedCategories?: string[];
  created_at: string;
}

export class LoyaltyReferralService {
  // =====================================================
  // LOYALTY PROGRAM MANAGEMENT
  // =====================================================

  static async createLoyaltyProgram(programData: Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'>): Promise<LoyaltyProgram> {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .insert({
          ...programData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as LoyaltyProgram;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create loyalty program');
    }
  }

  static async getBusinessLoyaltyProgram(businessId: string): Promise<LoyaltyProgram | null> {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as LoyaltyProgram;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get loyalty program');
    }
  }

  static async joinLoyaltyProgram(customerId: string, businessId: string): Promise<CustomerLoyalty> {
    try {
      // Check if customer is already in the program
      const { data: existing } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (existing) {
        return existing as CustomerLoyalty;
      }

      // Create new loyalty record
      const { data, error } = await supabase
        .from('customer_loyalty')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          total_points: 0,
          available_points: 0,
          total_spent: 0,
          total_visits: 0,
          join_date: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Give welcome bonus if configured
      await this.awardWelcomeBonus(customerId, businessId);

      return data as CustomerLoyalty;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to join loyalty program');
    }
  }

  private static async awardWelcomeBonus(customerId: string, businessId: string): Promise<void> {
    try {
      const program = await this.getBusinessLoyaltyProgram(businessId);
      const welcomeBonus = 100; // Default welcome bonus

      if (program && welcomeBonus > 0) {
        await this.awardPoints(customerId, businessId, welcomeBonus, 'Welcome bonus for joining loyalty program');
      }
    } catch (error) {
      console.error('Failed to award welcome bonus:', error);
    }
  }

  // =====================================================
  // POINTS MANAGEMENT
  // =====================================================

  static async awardPoints(
    customerId: string,
    businessId: string,
    points: number,
    description: string,
    orderId?: string,
    expiryDays?: number
  ): Promise<LoyaltyTransaction> {
    try {
      // Create loyalty transaction
      const expiresAt = expiryDays 
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const { data: transaction, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          order_id: orderId,
          type: 'earned',
          points,
          description,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update customer loyalty totals
      await supabase.rpc('update_customer_loyalty_points', {
        p_customer_id: customerId,
        p_business_id: businessId,
        p_points_change: points
      });

      // Check for tier upgrades
      await this.checkTierUpgrade(customerId, businessId);

      // Send notification
      await this.notifyPointsAwarded(customerId, businessId, points, description);

      return transaction as LoyaltyTransaction;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to award points');
    }
  }

  static async redeemPoints(
    customerId: string,
    businessId: string,
    points: number,
    rewardId: string,
    orderId?: string
  ): Promise<{
    transaction: LoyaltyTransaction;
    coupon?: CouponCode;
  }> {
    try {
      // Check available points
      const { data: loyalty } = await supabase
        .from('customer_loyalty')
        .select('available_points')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (!loyalty || loyalty.available_points < points) {
        throw new Error('Insufficient points for redemption');
      }

      // Get reward details
      const program = await this.getBusinessLoyaltyProgram(businessId);
      const reward = program?.rewards.find(r => r.id === rewardId);
      
      if (!reward) {
        throw new Error('Reward not found');
      }

      // Create redemption transaction
      const { data: transaction, error } = await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          order_id: orderId,
          type: 'redeemed',
          points: -points,
          description: `Redeemed: ${reward.name}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update customer loyalty totals
      await supabase.rpc('update_customer_loyalty_points', {
        p_customer_id: customerId,
        p_business_id: businessId,
        p_points_change: -points
      });

      // Generate coupon if applicable
      let coupon: CouponCode | undefined;
      if (reward.discountType !== 'free_item') {
        coupon = await this.generateRewardCoupon(customerId, businessId, reward);
      }

      // Send notification
      await this.notifyPointsRedeemed(customerId, businessId, points, reward.name);

      return { transaction: transaction as LoyaltyTransaction, coupon };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to redeem points');
    }
  }

  private static async generateRewardCoupon(
    customerId: string,
    businessId: string,
    reward: LoyaltyProgram['rewards'][0]
  ): Promise<CouponCode> {
    try {
      const couponCode = `LOYALTY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + reward.validityDays);

      const { data, error } = await supabase
        .from('coupon_codes')
        .insert({
          business_id: businessId,
          code: couponCode,
          name: `Loyalty Reward: ${reward.name}`,
          description: reward.description,
          discount_type: reward.discountType,
          discount_value: reward.discountValue,
          min_order_value: reward.minOrderValue,
          max_uses: reward.maxUses || 1,
          used_count: 0,
          valid_from: new Date().toISOString(),
          valid_until: validUntil.toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create customer-specific coupon assignment
      await supabase
        .from('customer_coupons')
        .insert({
          customer_id: customerId,
          coupon_id: data.id,
          assigned_at: new Date().toISOString()
        });

      return data as CouponCode;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate reward coupon');
    }
  }

  static async calculateOrderPoints(
    customerId: string,
    businessId: string,
    orderValue: number,
    orderItems?: any[]
  ): Promise<number> {
    try {
      const program = await this.getBusinessLoyaltyProgram(businessId);
      if (!program || !program.rules.pointsPerRupee) return 0;

      let basePoints = Math.floor(orderValue * program.rules.pointsPerRupee);

      // Apply tier multiplier
      const { data: loyalty } = await supabase
        .from('customer_loyalty')
        .select('current_tier')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (loyalty?.current_tier && program.tiers) {
        const tier = program.tiers.find(t => t.name === loyalty.current_tier);
        if (tier) {
          basePoints = Math.floor(basePoints * tier.multiplier);
        }
      }

      // Apply rule-based multipliers
      if (program.rules.multipliers) {
        for (const multiplier of program.rules.multipliers) {
          if (this.checkMultiplierCondition(multiplier.condition, orderValue, orderItems)) {
            basePoints = Math.floor(basePoints * multiplier.multiplier);
          }
        }
      }

      return basePoints;
    } catch (error: any) {
      console.error('Failed to calculate order points:', error);
      return 0;
    }
  }

  private static checkMultiplierCondition(
    condition: string,
    orderValue: number,
    orderItems?: any[]
  ): boolean {
    // Simple condition checking - in production, use a more sophisticated rules engine
    if (condition.includes('weekend')) {
      const day = new Date().getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }
    
    if (condition.includes('first_order')) {
      // Would need to check if this is customer's first order
      return false;
    }

    if (condition.includes('high_value') && orderValue > 1000) {
      return true;
    }

    return false;
  }

  private static async checkTierUpgrade(customerId: string, businessId: string): Promise<void> {
    try {
      const [program, loyalty] = await Promise.all([
        this.getBusinessLoyaltyProgram(businessId),
        supabase
          .from('customer_loyalty')
          .select('*')
          .eq('customer_id', customerId)
          .eq('business_id', businessId)
          .single()
      ]);

      if (!program?.tiers || !loyalty.data) return;

      const currentTotalPoints = loyalty.data.total_points;
      const currentTier = loyalty.data.current_tier;

      // Find the highest tier the customer qualifies for
      const qualifiedTier = program.tiers
        .filter(tier => currentTotalPoints >= tier.minPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0];

      if (qualifiedTier && qualifiedTier.name !== currentTier) {
        // Upgrade tier
        await supabase
          .from('customer_loyalty')
          .update({ 
            current_tier: qualifiedTier.name,
            last_activity: new Date().toISOString()
          })
          .eq('customer_id', customerId)
          .eq('business_id', businessId);

        // Send tier upgrade notification
        await this.notifyTierUpgrade(customerId, businessId, qualifiedTier.name);
      }
    } catch (error) {
      console.error('Failed to check tier upgrade:', error);
    }
  }

  // =====================================================
  // REFERRAL SYSTEM
  // =====================================================

  static async createReferralProgram(programData: Omit<ReferralProgram, 'id' | 'created_at'>): Promise<ReferralProgram> {
    try {
      const { data, error } = await supabase
        .from('referral_programs')
        .insert({
          ...programData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReferralProgram;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create referral program');
    }
  }

  static async generateReferralCode(userId: string): Promise<string> {
    try {
      // Generate unique referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      const name = profile?.name || 'USER';
      const namePrefix = name.substring(0, 3).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const referralCode = `${namePrefix}${randomSuffix}`;

      // Check if code already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (existing) {
        // Generate new code if exists
        return this.generateReferralCode(userId);
      }

      // Update user profile with referral code
      await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      return referralCode;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate referral code');
    }
  }

  static async applyReferralCode(
    refereeId: string,
    referralCode: string,
    orderId?: string
  ): Promise<Referral> {
    try {
      // Find referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) {
        throw new Error('Invalid referral code');
      }

      if (referrer.id === refereeId) {
        throw new Error('Cannot refer yourself');
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrer.id)
        .eq('referee_id', refereeId)
        .single();

      if (existingReferral) {
        throw new Error('Referral already exists');
      }

      // Get active referral program
      const { data: program } = await supabase
        .from('referral_programs')
        .select('*')
        .eq('type', 'platform')
        .eq('is_active', true)
        .single();

      if (!program) {
        throw new Error('No active referral program');
      }

      // Create referral record
      const { data: referral, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referee_id: refereeId,
          referral_code: referralCode,
          program_id: program.id,
          status: orderId ? 'completed' : 'pending',
          order_id: orderId,
          rewards_given: false,
          created_at: new Date().toISOString(),
          completed_at: orderId ? new Date().toISOString() : undefined
        })
        .select()
        .single();

      if (error) throw error;

      // Give immediate referee reward if applicable
      if (program.refereeReward && orderId) {
        await this.giveReferralReward(refereeId, program.refereeReward, 'referee');
      }

      return referral as Referral;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply referral code');
    }
  }

  static async completeReferral(referralId: string, orderValue: number): Promise<void> {
    try {
      // Get referral details
      const { data: referral, error } = await supabase
        .from('referrals')
        .select(`
          *,
          program:referral_programs!referrals_program_id_fkey (*)
        `)
        .eq('id', referralId)
        .single();

      if (error || !referral) {
        throw new Error('Referral not found');
      }

      if (referral.status !== 'pending') {
        return; // Already completed
      }

      // Check if order meets minimum value requirement
      if (referral.program.conditions?.minOrderValue && orderValue < referral.program.conditions.minOrderValue) {
        return; // Order doesn't meet requirements
      }

      // Update referral status
      await supabase
        .from('referrals')
        .update({
          status: 'completed',
          order_value: orderValue,
          completed_at: new Date().toISOString()
        })
        .eq('id', referralId);

      // Give rewards if not already given
      if (!referral.rewards_given) {
        await Promise.all([
          this.giveReferralReward(referral.referrer_id, referral.program.referrerReward, 'referrer'),
          this.giveReferralReward(referral.referee_id, referral.program.refereeReward, 'referee')
        ]);

        // Mark rewards as given
        await supabase
          .from('referrals')
          .update({ rewards_given: true })
          .eq('id', referralId);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete referral');
    }
  }

  private static async giveReferralReward(
    userId: string,
    reward: ReferralProgram['referrerReward'],
    type: 'referrer' | 'referee'
  ): Promise<void> {
    try {
      switch (reward.type) {
        case 'points':
          // Award platform loyalty points or cash equivalent
          await this.awardGenericPoints(userId, reward.value, `Referral reward (${type})`);
          break;
        
        case 'discount':
          // Create discount coupon
          await this.createReferralCoupon(userId, reward.value, type);
          break;
        
        case 'cash':
          // Credit to wallet (would need wallet system)
          await this.creditWallet(userId, reward.value, `Referral reward (${type})`);
          break;
        
        case 'free_service':
          // Create free service voucher
          await this.createFreeServiceVoucher(userId, reward.value, type);
          break;
      }

      // Send notification
      await this.notifyReferralReward(userId, reward, type);
    } catch (error) {
      console.error('Failed to give referral reward:', error);
    }
  }

  private static async awardGenericPoints(userId: string, points: number, description: string): Promise<void> {
    // Award platform-wide loyalty points
    await supabase
      .from('platform_loyalty')
      .upsert({
        user_id: userId,
        total_points: points,
        description
      }, {
        onConflict: 'user_id'
      });
  }

  private static async createReferralCoupon(userId: string, discountValue: number, type: string): Promise<void> {
    const couponCode = `REF_${type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await supabase
      .from('coupon_codes')
      .insert({
        code: couponCode,
        name: `Referral ${type} reward`,
        description: `${discountValue}% discount for successful referral`,
        discount_type: 'percentage',
        discount_value: discountValue,
        max_uses: 1,
        used_count: 0,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
        created_at: new Date().toISOString()
      });

    // Assign to user
    const { data: coupon } = await supabase
      .from('coupon_codes')
      .select('id')
      .eq('code', couponCode)
      .single();

    if (coupon) {
      await supabase
        .from('customer_coupons')
        .insert({
          customer_id: userId,
          coupon_id: coupon.id,
          assigned_at: new Date().toISOString()
        });
    }
  }

  private static async creditWallet(userId: string, amount: number, description: string): Promise<void> {
    // Credit user's wallet - would need wallet system implementation
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'credit',
        description,
        created_at: new Date().toISOString()
      });
  }

  private static async createFreeServiceVoucher(userId: string, value: number, type: string): Promise<void> {
    // Create a service voucher
    const voucherCode = `SERVICE_${type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await supabase
      .from('service_vouchers')
      .insert({
        user_id: userId,
        voucher_code: voucherCode,
        value,
        description: `Free service voucher - referral ${type} reward`,
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        is_used: false,
        created_at: new Date().toISOString()
      });
  }

  // =====================================================
  // COUPON MANAGEMENT
  // =====================================================

  static async validateCoupon(
    couponCode: string,
    customerId: string,
    orderValue: number,
    businessId?: string
  ): Promise<{
    isValid: boolean;
    coupon?: CouponCode;
    discount?: number;
    error?: string;
  }> {
    try {
      const { data: coupon, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return { isValid: false, error: 'Invalid coupon code' };
      }

      // Check business restriction
      if (coupon.business_id && businessId && coupon.business_id !== businessId) {
        return { isValid: false, error: 'Coupon not applicable for this business' };
      }

      // Check validity dates
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);

      if (now < validFrom || now > validUntil) {
        return { isValid: false, error: 'Coupon has expired or not yet valid' };
      }

      // Check usage limits
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { isValid: false, error: 'Coupon usage limit exceeded' };
      }

      // Check minimum order value
      if (coupon.min_order_value && orderValue < coupon.min_order_value) {
        return { 
          isValid: false, 
          error: `Minimum order value of ₹${coupon.min_order_value} required` 
        };
      }

      // Check if customer has already used this coupon
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('customer_id', customerId)
        .single();

      if (usage && coupon.max_uses === 1) {
        return { isValid: false, error: 'Coupon already used' };
      }

      // Calculate discount
      let discount = 0;
      switch (coupon.discount_type) {
        case 'percentage':
          discount = (orderValue * coupon.discount_value) / 100;
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount);
          }
          break;
        case 'fixed_amount':
          discount = coupon.discount_value;
          break;
        case 'free_shipping':
          discount = 50; // Assume shipping cost
          break;
      }

      return {
        isValid: true,
        coupon: coupon as CouponCode,
        discount: Math.min(discount, orderValue)
      };
    } catch (error: any) {
      return { isValid: false, error: 'Failed to validate coupon' };
    }
  }

  static async applyCoupon(
    couponCode: string,
    customerId: string,
    orderId: string,
    orderValue: number,
    discountAmount: number
  ): Promise<void> {
    try {
      const { data: coupon } = await supabase
        .from('coupon_codes')
        .select('id')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (!coupon) throw new Error('Coupon not found');

      // Record coupon usage
      await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: coupon.id,
          customer_id: customerId,
          order_id: orderId,
          order_value: orderValue,
          discount_amount: discountAmount,
          used_at: new Date().toISOString()
        });

      // Update coupon usage count
      await supabase.rpc('increment_coupon_usage', {
        coupon_id: coupon.id
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply coupon');
    }
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  private static async notifyPointsAwarded(
    customerId: string,
    businessId: string,
    points: number,
    description: string
  ): Promise<void> {
    // Implementation would integrate with notification service
  }

  private static async notifyPointsRedeemed(
    customerId: string,
    businessId: string,
    points: number,
    rewardName: string
  ): Promise<void> {
    // Implementation would integrate with notification service
  }

  private static async notifyTierUpgrade(
    customerId: string,
    businessId: string,
    newTier: string
  ): Promise<void> {
    // Implementation would integrate with notification service
  }

  private static async notifyReferralReward(
    userId: string,
    reward: ReferralProgram['referrerReward'],
    type: 'referrer' | 'referee'
  ): Promise<void> {
    // Implementation would integrate with notification service
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  static async getLoyaltyAnalytics(businessId: string) {
    try {
      const [members, transactions, redemptions] = await Promise.all([
        supabase
          .from('customer_loyalty')
          .select('*', { count: 'exact' })
          .eq('business_id', businessId),
        supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('business_id', businessId)
          .eq('type', 'earned'),
        supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('business_id', businessId)
          .eq('type', 'redeemed')
      ]);

      const totalMembers = members.count || 0;
      const totalPointsAwarded = transactions.data?.reduce((sum, t) => sum + t.points, 0) || 0;
      const totalPointsRedeemed = Math.abs(redemptions.data?.reduce((sum, t) => sum + t.points, 0) || 0);

      return {
        totalMembers,
        totalPointsAwarded,
        totalPointsRedeemed,
        redemptionRate: totalPointsAwarded > 0 ? (totalPointsRedeemed / totalPointsAwarded) * 100 : 0,
        activeMembers: members.data?.filter(m => {
          const lastActivity = new Date(m.last_activity);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return lastActivity > thirtyDaysAgo;
        }).length || 0
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get loyalty analytics');
    }
  }

  static async getReferralAnalytics() {
    try {
      const [totalReferrals, completedReferrals, pendingReferrals] = await Promise.all([
        supabase.from('referrals').select('*', { count: 'exact' }),
        supabase.from('referrals').select('*', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('referrals').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      const conversionRate = (totalReferrals.count || 0) > 0 
        ? ((completedReferrals.count || 0) / (totalReferrals.count || 0)) * 100 
        : 0;

      return {
        totalReferrals: totalReferrals.count || 0,
        completedReferrals: completedReferrals.count || 0,
        pendingReferrals: pendingReferrals.count || 0,
        conversionRate
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get referral analytics');
    }
  }
}

export default LoyaltyReferralService;

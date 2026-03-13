// ============================================================
// DarkEarn - ZK Reputation Score Circuit
// Proves your band (0-4) without revealing any private data.
//
// Private inputs (read from BountyEscrow, never shown):
//   darkearn_completions      - count of WorkApproved events
//   darkearn_approval_rate    - approved / total applications (0-100)
//   darkearn_dispute_rate     - disputed / total completions (0-100)
//   darkearn_account_age_days - days since first DarkEarn interaction
//
// Public output:
//   score_band - 0 to 4, mathematically enforced
// ============================================================

fn compute_band(
    completions: u64,
    approval_rate: u64,
    dispute_rate: u64,
    account_age_days: u64,
) -> u64 {
    // Band 4: 25+ completions, 92%+ approval, 0 disputes, 60+ days
    // Band 3: 15+ completions, 85%+ approval, <5% disputes, 30+ days
    // Band 2:  8+ completions, 80%+ approval, <10% disputes, 14+ days
    // Band 1:  3+ completions, 70%+ approval, 0 disputes, 7+ days
    // Band 0:  account exists (1+ days)

    let is_band_4 = (completions >= 25)
        & (approval_rate >= 92)
        & (dispute_rate == 0)
        & (account_age_days >= 60);

    let is_band_3 = (completions >= 15)
        & (approval_rate >= 85)
        & (dispute_rate < 5)
        & (account_age_days >= 30);

    let is_band_2 = (completions >= 8)
        & (approval_rate >= 80)
        & (dispute_rate < 10)
        & (account_age_days >= 14);

    let is_band_1 = (completions >= 3)
        & (approval_rate >= 70)
        & (dispute_rate == 0)
        & (account_age_days >= 7);

    // Highest qualifying band wins - check top-down
    if is_band_4 {
        4
    } else if is_band_3 {
        3
    } else if is_band_2 {
        2
    } else if is_band_1 {
        1
    } else {
        0
    }
}

fn main(
    // Private inputs - never revealed
    darkearn_completions: u64,
    darkearn_approval_rate: u64,
    darkearn_dispute_rate: u64,
    darkearn_account_age_days: u64,
    // Public output - the only thing the verifier sees
    score_band: pub u64,
) {
    // Account must exist (at least 1 day old) for any band
    assert(darkearn_account_age_days >= 1, "Account must be at least 1 day old");

    // Approval rate and dispute rate must be valid percentages
    assert(darkearn_approval_rate <= 100, "Approval rate must be 0-100");
    assert(darkearn_dispute_rate <= 100, "Dispute rate must be 0-100");

    // Score band must be in valid range
    assert(score_band <= 4, "Score band must be 0-4");

    // Compute the mathematically correct band from private inputs
    let computed_band = compute_band(
        darkearn_completions,
        darkearn_approval_rate,
        darkearn_dispute_rate,
        darkearn_account_age_days,
    );

    // The declared band MUST exactly match the computed band.
    // You cannot claim higher. You cannot claim lower.
    // The circuit enforces honesty in both directions.
    assert(computed_band == score_band, "Declared band does not match computed band");
}

// ============================================================
// TESTS
// ============================================================

// Test 1: Perfect Band 4 inputs prove successfully, output is 4
#[test]
fn test_perfect_band_4() {
    // 30 completions, 95% approval, 0% disputes, 90 days
    main(30, 95, 0, 90, 4);
}

// Test 2: Band 2 inputs claiming Band 4 - circuit rejects the false claim
#[test(should_fail_with = "Declared band does not match computed band")]
fn test_band_2_claiming_band_4_fails() {
    // These inputs qualify for Band 2 (8+ completions, 80%+ approval, <10% disputes, 14+ days)
    // but NOT Band 4 - claiming 4 must fail
    main(10, 82, 5, 20, 4);
}

// Test 3: Account age of zero days fails every band above 0
#[test(should_fail_with = "Account must be at least 1 day old")]
fn test_zero_age_fails() {
    // Even with perfect stats, 0 days old is rejected
    main(30, 95, 0, 0, 4);
}

// Test 4: High dispute rate (20%) correctly blocks Band 3 and Band 4
#[test(should_fail_with = "Declared band does not match computed band")]
fn test_high_dispute_blocks_band_3() {
    // 20 completions, 90% approval, 20% disputes, 60 days
    // Would qualify for Band 3 on completions/approval/age
    // but 20% dispute rate blocks Band 3 (needs <5%) and Band 4 (needs 0%)
    // Actual band: Band 0 (dispute rate too high for any band)
    main(20, 90, 20, 60, 3);
}

// Test 5: Exactly at Band 3 boundary proves Band 3, fails if Band 4 is claimed
#[test]
fn test_exact_band_3_boundary_proves() {
    // Exactly Band 3 minimums: 15 completions, 85% approval, 4% disputes, 30 days
    // Disputes > 0 so cannot be Band 4
    main(15, 85, 4, 30, 3);
}

#[test(should_fail_with = "Declared band does not match computed band")]
fn test_exact_band_3_boundary_fails_band_4() {
    // Same inputs as above but claiming Band 4 - must fail
    main(15, 85, 4, 30, 4);
}

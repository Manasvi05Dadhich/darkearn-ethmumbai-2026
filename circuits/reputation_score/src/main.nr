

fn compute_band(
    completions: u64,
    approval_rate: u64,
    dispute_rate: u64,
    account_age_days: u64,
) -> u64 {


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
   
    darkearn_completions: u64,
    darkearn_approval_rate: u64,
    darkearn_dispute_rate: u64,
    darkearn_account_age_days: u64,

    score_band: pub u64,
) {

    assert(darkearn_account_age_days >= 1, "Account must be at least 1 day old");
    assert(darkearn_approval_rate <= 100, "Approval rate must be 0-100");
    assert(darkearn_dispute_rate <= 100, "Dispute rate must be 0-100");


    assert(score_band <= 4, "Score band must be 0-4");


    let computed_band = compute_band(
        darkearn_completions,
        darkearn_approval_rate,
        darkearn_dispute_rate,
        darkearn_account_age_days,
    );
    assert(computed_band == score_band, "Declared band does not match computed band");
}


#[test]
fn test_perfect_band_4() {
    
    main(30, 95, 0, 90, 4);
}


#[test(should_fail_with = "Declared band does not match computed band")]
fn test_band_2_claiming_band_4_fails() {
    main(10, 82, 5, 20, 4);
}


#[test(should_fail_with = "Account must be at least 1 day old")]
fn test_zero_age_fails() {
    
    main(30, 95, 0, 0, 4);
}


#[test(should_fail_with = "Declared band does not match computed band")]
fn test_high_dispute_blocks_band_3() {
    main(20, 90, 20, 60, 3);
}

#[test]
fn test_exact_band_3_boundary_proves() {

    main(15, 85, 4, 30, 3);
}

#[test(should_fail_with = "Declared band does not match computed band")]
fn test_exact_band_3_boundary_fails_band_4() {

    main(15, 85, 4, 30, 4);
}
